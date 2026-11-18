"""
VONUMO studio props, modelled headless in Blender (bpy 5.x):
  chair.glb    ergonomic office chair: 5-star base with casters, gas lift, mechanism, cushioned seat,
               curved mesh backrest with a tubular frame, lumbar spine and armrests
  monitor.glb  27" display: thin housing with rounded corners and a chin, neck and oval base;
               the panel is a separate mesh "screen" (material "screen", UV 0…1) so three.js can
               put the animated interface on it.

    python scripts/blender/props.py -- <out_dir>
Units are metres. Blender is Z-up; the glTF exporter converts to Y-up.
"""
import math
import sys

import bpy  # noqa: E402 (must come before bmesh)
import bmesh
from mathutils import Matrix, Vector

OUT = sys.argv[sys.argv.index("--") + 1]


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, rgb, rough, metal=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m


def obj_from_bm(name, bm, material):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    me.materials.append(material)
    return ob


def rbox(name, size, loc, material, bevel=0.01, seg=3, rot=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    ob = obj_from_bm(name, bm, material)
    ob.location = loc
    if rot:
        ob.rotation_euler = rot
    if bevel:
        md = ob.modifiers.new("b", "BEVEL")
        md.width = bevel
        md.segments = seg
        md.limit_method = "ANGLE"
    return ob


def cyl(name, r, h, loc, material, seg=32, rot=None, r2=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r2 if r2 is not None else r, depth=h)
    ob = obj_from_bm(name, bm, material)
    ob.location = loc
    if rot:
        ob.rotation_euler = rot
    md = ob.modifiers.new("b", "BEVEL")
    md.width = min(r, h) * 0.15
    md.segments = 2
    md.limit_method = "ANGLE"
    return ob


def smooth_all():
    for ob in bpy.context.scene.objects:
        if ob.type == "MESH":
            for p in ob.data.polygons:
                p.use_smooth = True
            ob.modifiers.new("ws", "WEIGHTED_NORMAL").keep_sharp = True


def export(path):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True, export_apply=True,
                              export_texcoords=True, export_normals=True, export_materials="EXPORT", export_yup=True)


# ======================================================================== chair
reset()
plastic = mat("chair_plastic", (0.015, 0.015, 0.017), 0.45)
alu = mat("chair_alu", (0.62, 0.63, 0.65), 0.28, 1.0)
fabric = mat("chair_fabric", (0.03, 0.032, 0.036), 0.92)
mesh_mat = mat("chair_mesh", (0.02, 0.022, 0.026), 0.8)

# 5-star base: tapered aluminium legs + hub, casters with forks
cyl("hub", 0.055, 0.07, (0, 0, 0.1), alu)
for i in range(5):
    a = i * 2 * math.pi / 5
    leg = rbox(f"leg{i}", (0.3, 0.045, 0.035), (0.15 * math.cos(a), 0.15 * math.sin(a), 0.095), alu, 0.008, 2, (0, -0.08, a))
    ex, ey = 0.31 * math.cos(a), 0.31 * math.sin(a)
    rbox(f"fork{i}", (0.03, 0.03, 0.05), (ex, ey, 0.065), plastic, 0.006, 2)
    cyl(f"caster{i}", 0.028, 0.03, (ex, ey, 0.03), plastic, 24, (math.pi / 2, 0, a + math.pi / 2))
# gas lift, sleeve, mechanism
cyl("sleeve", 0.035, 0.16, (0, 0, 0.21), plastic, 32)
cyl("piston", 0.022, 0.16, (0, 0, 0.36), alu, 24)
rbox("mechanism", (0.24, 0.22, 0.05), (0, 0, 0.455), plastic, 0.01, 2)
# seat: cushion + shell
rbox("seat_shell", (0.5, 0.48, 0.03), (0, 0.0, 0.49), plastic, 0.012, 3)
rbox("seat_cushion", (0.49, 0.47, 0.07), (0, 0.0, 0.535), fabric, 0.03, 5)
# curved mesh backrest with tubular frame
W_, H_, R_ = 0.46, 0.56, 0.7
bm = bmesh.new()
nx, ny = 16, 12
verts = []
for j in range(ny + 1):
    row = []
    for i in range(nx + 1):
        u, v = i / nx - 0.5, j / ny
        ang = u * W_ / R_
        x = R_ * math.sin(ang)
        y = -0.24 - (R_ - R_ * math.cos(ang)) * -1 + 0.04 * math.sin(v * math.pi)  # curve towards the sitter
        z = 0.62 + v * H_
        row.append(bm.verts.new((x, y + 0.0, z)))
    verts.append(row)
for j in range(ny):
    for i in range(nx):
        bm.faces.new((verts[j][i], verts[j][i + 1], verts[j + 1][i + 1], verts[j + 1][i]))
border = [verts[0][i] for i in range(nx + 1)] + [verts[j][nx] for j in range(1, ny + 1)] + \
         [verts[ny][i] for i in range(nx - 1, -1, -1)] + [verts[j][0] for j in range(ny - 1, 0, -1)]
border = [tuple(v.co) for v in border]  # copy before the bmesh is freed
back = obj_from_bm("back_mesh", bm, mesh_mat)
sol = back.modifiers.new("t", "SOLIDIFY")
sol.thickness = 0.012
# frame: curve along the panel border with a round bevel
cu = bpy.data.curves.new("frame", "CURVE")
cu.dimensions = "3D"
cu.bevel_depth = 0.012
cu.bevel_resolution = 4
sp = cu.splines.new("POLY")
sp.points.add(len(border) - 1)
for k, vv in enumerate(border):
    sp.points[k].co = (*vv, 1)
sp.use_cyclic_u = True
fr = bpy.data.objects.new("back_frame", cu)
bpy.context.scene.collection.objects.link(fr)
cu.materials.append(plastic)
bpy.context.view_layer.objects.active = fr
fr.select_set(True)
bpy.ops.object.convert(target="MESH")
fr.select_set(False)
# spine from mechanism to backrest, lumbar pad
rbox("spine", (0.06, 0.03, 0.42), (0, -0.27, 0.62), plastic, 0.01, 3, (0.18, 0, 0))
rbox("lumbar", (0.32, 0.03, 0.08), (0, -0.215, 0.8), fabric, 0.015, 3)
# armrests: post + pad
for s in (-1, 1):
    rbox(f"arm_post{s}", (0.03, 0.05, 0.22), (s * 0.27, -0.02, 0.62), plastic, 0.008, 2)
    rbox(f"arm_pad{s}", (0.07, 0.26, 0.03), (s * 0.27, 0.0, 0.745), plastic, 0.012, 3)
smooth_all()
export(f"{OUT}/chair.glb")

# ======================================================================== monitor
reset()
body = mat("monitor_body", (0.02, 0.021, 0.024), 0.35, 0.6)
stand = mat("monitor_stand", (0.55, 0.56, 0.58), 0.3, 1.0)
screen = mat("screen", (0.0, 0.0, 0.0), 0.08)
SW, SH = 0.6, 0.34
rbox("housing", (SW + 0.02, 0.025, SH + 0.045), (0, 0.0, 0.0), body, 0.008, 4)
# panel: a plane slightly in front of the housing, UV 0..1 (u right, v up)
bm = bmesh.new()
uvl = bm.loops.layers.uv.new("UVMap")
a = bm.verts.new((-SW / 2, -0.0131, -SH / 2 + 0.0125))
b = bm.verts.new((SW / 2, -0.0131, -SH / 2 + 0.0125))
c = bm.verts.new((SW / 2, -0.0131, SH / 2 + 0.0125))
d = bm.verts.new((-SW / 2, -0.0131, SH / 2 + 0.0125))
f = bm.faces.new((a, b, c, d))
for loop, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
    loop[uvl].uv = uv
f.normal_update()
if f.normal.y > 0:
    f.normal_flip()
obj_from_bm("screen", bm, screen)
rbox("neck", (0.07, 0.025, 0.3), (0, 0.06, -0.24), stand, 0.01, 3)
rbox("joint", (0.1, 0.06, 0.05), (0, 0.03, -0.06), body, 0.012, 3)
cyl("base", 0.13, 0.012, (0, 0.03, -0.39), stand, 64)
bpy.data.objects["base"].scale = (1.25, 0.8, 1)
export(f"{OUT}/monitor.glb")
print("ok")
