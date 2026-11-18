"""
VONUMO pavilion: detailed hard-surface model, built and baked in Blender (bpy 5.x, headless).

    python scripts/blender/pavilion.py <out_dir>

Output:
  <out_dir>/pavilion.glb   geometry, material slots by name, UV0 in metres, UV1 lightmap atlas
  <out_dir>/ao.png         Cycles-baked ambient occlusion on UV1 (2048², converted to WebP afterwards)

Dimensions match app/components/three/Studio.tsx: three.js coordinates (x, y, z) are used below
and converted to Blender's Z-up as (x, -z, y). The glTF exporter converts back to Y-up.
The whole model lives in the Studio group that is lowered by SINK.
"""
import math
import sys

import bpy  # noqa: E402 (bpy must be imported before bmesh)
import bmesh

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else sys.argv[-1]

FLOOR, CEIL, FRONT, BACK, LEFT, RIGHT, SINK = 2.125, 5.625, 3.4, -4.7, -5.6, 6.8, 1.4
W, D, H = RIGHT - LEFT, FRONT - BACK, CEIL - FLOOR
CX, CZ = (LEFT + RIGHT) / 2, (FRONT + BACK) / 2
GLASS_L = -3.2

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
COLL = bpy.data.collections.new("pavilion")
scene.collection.children.link(COLL)

MATS = {}


def mat(name, rgb=(0.05, 0.05, 0.06), rough=0.5, metal=0.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    MATS[name] = m
    return m


def to_b(x, y, z):
    return (x, -z, y)


def box(name, size, center, material, bevel=0.008, segments=2):
    sx, sy, sz = size
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(sx, sz, sy), verts=bm.verts)  # three (x, y, z) → blender (x, z-depth, y-height)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = to_b(*center)
    COLL.objects.link(ob)
    me.materials.append(material)
    if bevel > 0:
        md = ob.modifiers.new("bevel", "BEVEL")
        md.width = min(bevel, min(size) * 0.45)
        md.segments = segments
        md.limit_method = "ANGLE"
    return ob


def cylinder(name, r, h, center, material, verts=48):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r, depth=h)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = to_b(*center)
    COLL.objects.link(ob)
    me.materials.append(material)
    return ob


# ---------------------------------------------------------------- materials (slot names = keys in three.js)
M = {
    "plinth": mat("plinth", (0.06, 0.065, 0.075), 0.7),
    "slab": mat("slab", (0.03, 0.03, 0.035), 0.4, 0.4),
    "fascia": mat("fascia", (0.05, 0.055, 0.06), 0.3, 0.9),
    "oak": mat("oak", (0.45, 0.26, 0.14), 0.6),
    "cladding": mat("cladding", (0.02, 0.022, 0.026), 0.55, 0.3),
    "marble": mat("marble", (0.7, 0.71, 0.74), 0.25),
    "mullion": mat("mullion", (0.01, 0.01, 0.012), 0.3, 0.85),
    "metal": mat("metal", (0.6, 0.6, 0.62), 0.3, 1.0),
    "walnut": mat("walnut", (0.2, 0.12, 0.08), 0.4),
    "dark": mat("dark", (0.02, 0.02, 0.025), 0.4, 0.5),
}

# ---------------------------------------------------------------- plinth, steps, slab
box("plinth", (13.6, FLOOR - 0.15, 8.6), (CX + 0.1, (FLOOR - 0.15) / 2, CZ + 0.2), M["plinth"], 0.012)
# lower step with a shadow reveal at its base, where the blue LED strip sits (three.js adds the emissive strip)
box("step", (12, 0.25, 1.1), (CX + 0.4, SINK + 0.175, FRONT + 1.45), M["plinth"], 0.01)
box("step_reveal", (11.9, 0.05, 1.0), (CX + 0.4, SINK + 0.025, FRONT + 1.4), M["dark"], 0.0)
box("floor_slab", (W + 0.6, 0.3, D + 1.2), (CX, FLOOR - 0.15, CZ + 0.6), M["slab"], 0.01)

# ---------------------------------------------------------------- roof: core, metal fascia, drip cap, oak soffit planks
RW, RD, RX, RZ = W + 2.2, D + 2.6, CX + 0.3, CZ + 1.0
box("roof_core", (RW - 0.08, 0.36, RD - 0.08), (RX, CEIL + 0.2, RZ), M["slab"], 0.0)
for nm, size, c in [
    ("fascia_front", (RW, 0.42, 0.04), (RX, CEIL + 0.21, RZ + RD / 2 - 0.02)),
    ("fascia_back", (RW, 0.42, 0.04), (RX, CEIL + 0.21, RZ - RD / 2 + 0.02)),
    ("fascia_left", (0.04, 0.42, RD), (RX - RW / 2 + 0.02, CEIL + 0.21, RZ)),
    ("fascia_right", (0.04, 0.42, RD), (RX + RW / 2 - 0.02, CEIL + 0.21, RZ)),
]:
    box(nm, size, c, M["fascia"], 0.004)
box("drip_cap", (RW + 0.04, 0.025, RD + 0.04), (RX, CEIL + 0.43, RZ), M["fascia"], 0.006)
# aluminium channel that holds the warm LED line under the roof edge
for nm, size, c in [
    ("led_ch_front", (RW - 0.1, 0.03, 0.06), (RX, CEIL - 0.005, RZ + RD / 2 - 0.08)),
    ("led_ch_left", (0.06, 0.03, RD - 0.1), (RX - RW / 2 + 0.08, CEIL - 0.005, RZ)),
    ("led_ch_right", (0.06, 0.03, RD - 0.1), (RX + RW / 2 - 0.08, CEIL - 0.005, RZ)),
]:
    box(nm, size, c, M["metal"], 0.003)
# oak soffit: planks 17 cm with 12 mm shadow joints along the full roof underside
PW, GAP = 0.17, 0.012
n = int((RD - 0.2) / (PW + GAP))
z0 = RZ - (n * (PW + GAP)) / 2 + PW / 2
for i in range(n):
    box(f"plank_{i:02d}", (RW - 0.2, 0.02, PW), (RX, CEIL + 0.006, z0 + i * (PW + GAP)), M["oak"], 0.003, 1)
# recessed downlight trims (the emissive discs stay in three.js)
for i in range(9):
    cylinder(f"trim_out_{i}", 0.1, 0.008, (LEFT + 0.6 + i * 1.5, CEIL - 0.006, FRONT + 1.1), M["metal"])
for x in (-3.6, -1.2, 1.2, 3.6, 5.6):
    for z in (-3.2, -0.6, 1.8):
        cylinder(f"trim_in_{x}_{z}", 0.085, 0.008, (x, CEIL - 0.036, z), M["metal"])

# ---------------------------------------------------------------- monolith and side wall: dark cladding with vertical joints
mono_w = GLASS_L - LEFT
box("monolith_core", (mono_w - 0.02, H, 0.46), ((LEFT + GLASS_L) / 2, FLOOR + H / 2, FRONT - 0.02), M["cladding"], 0.0)
np_ = 5
pw = (mono_w - 0.01 * (np_ - 1)) / np_
for i in range(np_):
    x = LEFT + pw / 2 + i * (pw + 0.01)
    box(f"mono_panel_{i}", (pw, H - 0.01, 0.025), (x, FLOOR + H / 2, FRONT + 0.225), M["cladding"], 0.004)
box("side_core", (0.46, H, D), (LEFT, FLOOR + H / 2, CZ), M["cladding"], 0.0)
ns = 14
sw = (D - 0.01 * (ns - 1)) / ns
for i in range(ns):
    z = BACK + sw / 2 + i * (sw + 0.01)
    box(f"side_panel_{i}", (0.025, H - 0.01, sw), (LEFT - 0.245, FLOOR + H / 2, z), M["cladding"], 0.004)

# ---------------------------------------------------------------- back wall: core + 4 book-matched marble slabs inside
box("back_core", (W, H, 0.26), (CX, FLOOR + H / 2, BACK - 0.02), M["cladding"], 0.0)
SLABS = 4
slab_w = (W - 0.006 * (SLABS - 1)) / SLABS
for i in range(SLABS):
    x = LEFT + slab_w / 2 + i * (slab_w + 0.006)
    ob = box(f"marble_slab_{i}", (slab_w, H, 0.03), (x, FLOOR + H / 2, BACK + 0.125), M["marble"], 0.003, 1)
    ob["bookmatch"] = i  # used for planar UVs below

# recessed dark panel behind the glowing V outline (three.js keeps the emissive outline)
box("v_panel_frame", (1.33, 2.68, 0.05), (0.4, FLOOR + 1.3, BACK + 0.155), M["metal"], 0.006)
box("v_panel", (1.25, 2.6, 0.06), (0.4, FLOOR + 1.3, BACK + 0.17), M["dark"], 0.004)

# ---------------------------------------------------------------- glazing frame: mullions, head and sill profiles, right side
for i in range(7):
    x = GLASS_L + (RIGHT - GLASS_L) * i / 6
    box(f"mullion_{i}", (0.07, H, 0.12), (x, FLOOR + H / 2, FRONT), M["mullion"], 0.006)
box("head_front", (RIGHT - GLASS_L, 0.07, 0.12), (( GLASS_L + RIGHT) / 2, CEIL - 0.035, FRONT), M["mullion"], 0.005)
box("sill_front", (RIGHT - GLASS_L, 0.05, 0.14), ((GLASS_L + RIGHT) / 2, FLOOR + 0.025, FRONT), M["mullion"], 0.005)
for i, z in enumerate([BACK, BACK + D / 3, BACK + 2 * D / 3]):
    box(f"mullion_r{i}", (0.12, H, 0.07), (RIGHT, FLOOR + H / 2, z), M["mullion"], 0.006)
box("head_right", (0.12, 0.07, D), (RIGHT, CEIL - 0.035, CZ), M["mullion"], 0.005)
box("sill_right", (0.14, 0.05, D), (RIGHT, FLOOR + 0.025, CZ), M["mullion"], 0.005)

# ---------------------------------------------------------------- interior: oak slat wall, desk with stands
n_sl = int((FRONT - 0.3 - (BACK + 0.2)) / 0.11)
for i in range(n_sl):
    z = BACK + 0.2 + 0.11 * (i + 0.5)
    box(f"slat_{i:02d}", (0.06, H - 0.08, 0.05), (LEFT + 0.36, FLOOR + (H - 0.08) / 2, z), M["oak"], 0.004, 1)
box("desk_top", (3.6, 0.04, 1.0), (-2.0, FLOOR + 0.75, -2.2), M["walnut"], 0.008)
for x in (-3.66, -0.34):
    box(f"desk_leg_{x}", (0.04, 0.73, 0.9), (x, FLOOR + 0.365, -2.2), M["metal"], 0.004)
box("desk_modesty", (3.2, 0.32, 0.02), (-2.0, FLOOR + 0.5, -2.62), M["metal"], 0.003)
for x, rot in ((-2.8, 0.05), (-1.6, -0.05)):
    box(f"mon_neck_{x}", (0.05, 0.33, 0.03), (x, FLOOR + 0.93, -2.5), M["metal"], 0.006)
    box(f"mon_base_{x}", (0.26, 0.012, 0.18), (x, FLOOR + 0.776, -2.43), M["metal"], 0.004)

# ---------------------------------------------------------------- apply modifiers, UV0 in metres (box projection), join
bpy.ops.object.select_all(action="DESELECT")
objs = [o for o in COLL.objects if o.type == "MESH"]
dg = bpy.context.evaluated_depsgraph_get()
for ob in objs:
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    for md in list(ob.modifiers):
        bpy.ops.object.modifier_apply(modifier=md.name)
    ob.select_set(False)

for ob in objs:
    me = ob.data
    bm = bmesh.new()
    bm.from_mesh(me)
    uv = bm.loops.layers.uv.verify()
    book = ob.get("bookmatch")
    for f in bm.faces:
        n = f.normal
        ax = max(range(3), key=lambda k: abs(n[k]))
        for l in f.loops:
            p = ob.matrix_world @ l.vert.co
            if book is not None:
                # marble: one slab = one full texture (0…1), alternate slabs mirrored = book-matched
                u = (p.x - (ob.location.x - (ob.dimensions.x / 2))) / ob.dimensions.x
                v = (p.z - (ob.location.z - ob.dimensions.z / 2)) / ob.dimensions.z
                l[uv].uv = ((1 - u) if book % 2 else u, v)
            elif ax == 2:
                l[uv].uv = (p.x, p.y)
            elif ax == 1:
                l[uv].uv = (p.x, p.z)
            else:
                l[uv].uv = (p.y, p.z)
    bm.to_mesh(me)
    bm.free()

for ob in objs:
    ob.select_set(True)
bpy.context.view_layer.objects.active = objs[0]
bpy.ops.object.join()
pav = bpy.context.view_layer.objects.active
pav.name = "pavilion"
pav.data.uv_layers[0].name = "UVMap"

# lightmap UVs (UV1)
lm = pav.data.uv_layers.new(name="Lightmap")
pav.data.uv_layers.active = lm
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.004, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
bpy.ops.object.mode_set(mode="OBJECT")

# ---------------------------------------------------------------- AO bake (ground plane in the bake only, for contact shadows)
ground = bpy.data.objects.new("ground", bpy.data.meshes.new("ground"))
gbm = bmesh.new()
bmesh.ops.create_grid(gbm, x_segments=1, y_segments=1, size=60)
gbm.to_mesh(ground.data)
gbm.free()
ground.location = (0, 0, SINK)  # world ground y=0 → local y = SINK
COLL.objects.link(ground)

scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = int(sys.argv[sys.argv.index("--samples") + 1]) if "--samples" in sys.argv else 96
scene.world = bpy.data.worlds.new("w")
scene.world.light_settings.distance = 1.6
SIZE = 2048
img = bpy.data.images.new("ao", SIZE, SIZE, alpha=False, float_buffer=False)
for m in pav.data.materials:
    nt = m.node_tree
    node = nt.nodes.new("ShaderNodeTexImage")
    node.image = img
    nt.nodes.active = node
bpy.ops.object.select_all(action="DESELECT")
pav.select_set(True)
bpy.context.view_layer.objects.active = pav
pav.data.uv_layers.active = pav.data.uv_layers["Lightmap"]
scene.render.bake.margin = 6
bpy.ops.object.bake(type="AO", use_clear=True)
img.filepath_raw = f"{OUT}/ao.png"
img.file_format = "PNG"
img.save()

# remove bake helper nodes before export, then export only the pavilion
for m in pav.data.materials:
    nt = m.node_tree
    for nd in [nd for nd in nt.nodes if nd.type == "TEX_IMAGE"]:
        nt.nodes.remove(nd)
bpy.data.objects.remove(ground)
pav.data.uv_layers.active = pav.data.uv_layers["UVMap"]
bpy.ops.object.select_all(action="DESELECT")
pav.select_set(True)
bpy.ops.export_scene.gltf(filepath=f"{OUT}/pavilion.glb", export_format="GLB", use_selection=True,
                          export_texcoords=True, export_normals=True, export_materials="EXPORT", export_yup=True)
print("faces", len(pav.data.polygons), "materials", [m.name for m in pav.data.materials])
