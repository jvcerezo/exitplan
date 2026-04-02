import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin, error } = await supabase.rpc("is_admin_user", { p_user_id: user.id });
  if (error || !isAdmin) redirect("/home");
  return user.id;
}

// ─── Server Actions ─────────────────────────────────────────────────────────

async function createNote(formData: FormData) {
  "use server";
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("dev_notes").insert({
    title: String(formData.get("title") || ""),
    body: String(formData.get("body") || ""),
    type: String(formData.get("type") || "note"),
    is_active: true,
    sort_order: 0,
  });
  revalidatePath("/admin/dev-notes");
}

async function toggleNote(formData: FormData) {
  "use server";
  await assertAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("id"));
  const current = formData.get("is_active") === "true";
  await admin.from("dev_notes").update({ is_active: !current }).eq("id", id);
  revalidatePath("/admin/dev-notes");
}

async function deleteNote(formData: FormData) {
  "use server";
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("dev_notes").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/dev-notes");
}

async function createRoadmapItem(formData: FormData) {
  "use server";
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("roadmap_items").insert({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || "") || null,
    status: String(formData.get("status") || "planned"),
    target_version: String(formData.get("target_version") || "") || null,
    is_visible: true,
    sort_order: 0,
  });
  revalidatePath("/admin/dev-notes");
}

async function updateRoadmapStatus(formData: FormData) {
  "use server";
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("roadmap_items").update({
    status: String(formData.get("status")),
    updated_at: new Date().toISOString(),
  }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/dev-notes");
}

async function toggleRoadmapVisibility(formData: FormData) {
  "use server";
  await assertAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("id"));
  const current = formData.get("is_visible") === "true";
  await admin.from("roadmap_items").update({ is_visible: !current }).eq("id", id);
  revalidatePath("/admin/dev-notes");
}

async function deleteRoadmapItem(formData: FormData) {
  "use server";
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("roadmap_items").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/dev-notes");
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function DevNotesPage() {
  await assertAdmin();
  const admin = createAdminClient();

  const { data: notes } = await admin
    .from("dev_notes")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  const { data: roadmap } = await admin
    .from("roadmap_items")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Developer Notes & Roadmap</h1>
        <p className="text-sm text-muted-foreground">
          Manage what users see at the bottom of the home screen.
        </p>
      </div>

      {/* ── Create Dev Note ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Developer Note</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createNote} className="space-y-3">
            <input name="title" placeholder="Title" required
              className="w-full h-9 rounded-md border bg-background px-3 text-sm" />
            <textarea name="body" placeholder="Message body..." required rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <select name="type" className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="note">Note</option>
                <option value="announcement">Announcement</option>
                <option value="update">Update</option>
              </select>
              <button type="submit"
                className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
                Add Note
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Existing Notes ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Developer Notes ({(notes ?? []).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(notes ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <div className="space-y-3">
              {(notes ?? []).map((note: any) => (
                <div key={note.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={note.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}>
                        {note.is_active ? "Active" : "Hidden"}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">{note.type}</Badge>
                      <span className="font-semibold text-sm">{note.title}</span>
                    </div>
                    <div className="flex gap-1">
                      <form action={toggleNote}>
                        <input type="hidden" name="id" value={note.id} />
                        <input type="hidden" name="is_active" value={String(note.is_active)} />
                        <button type="submit" className="h-7 rounded border px-2 text-xs hover:bg-muted">
                          {note.is_active ? "Hide" : "Show"}
                        </button>
                      </form>
                      <form action={deleteNote}>
                        <input type="hidden" name="id" value={note.id} />
                        <button type="submit" className="h-7 rounded border px-2 text-xs text-red-600 hover:bg-red-50">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.body}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Create Roadmap Item ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Roadmap Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createRoadmapItem} className="space-y-3">
            <input name="title" placeholder="Feature title" required
              className="w-full h-9 rounded-md border bg-background px-3 text-sm" />
            <input name="description" placeholder="Short description (optional)"
              className="w-full h-9 rounded-md border bg-background px-3 text-sm" />
            <div className="flex gap-2">
              <select name="status" className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <input name="target_version" placeholder="e.g. v1.2.0"
                className="h-9 w-32 rounded-md border bg-background px-3 text-sm" />
              <button type="submit"
                className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
                Add Item
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Existing Roadmap ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Roadmap ({(roadmap ?? []).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(roadmap ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No roadmap items yet.</p>
          ) : (
            <div className="space-y-3">
              {(roadmap ?? []).map((item: any) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={
                        item.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        item.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }>
                        {item.status === "in_progress" ? "In Progress" :
                         item.status === "completed" ? "Done" : "Planned"}
                      </Badge>
                      {!item.is_visible && (
                        <Badge className="bg-gray-100 text-gray-400">Hidden</Badge>
                      )}
                      {item.target_version && (
                        <Badge variant="outline" className="text-[11px]">{item.target_version}</Badge>
                      )}
                      <span className="font-semibold text-sm">{item.title}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <form action={updateRoadmapStatus} className="flex gap-1">
                        <input type="hidden" name="id" value={item.id} />
                        <select name="status" defaultValue={item.status}
                          className="h-7 rounded border bg-background px-1 text-xs">
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Done</option>
                        </select>
                        <button type="submit" className="h-7 rounded border px-2 text-xs hover:bg-muted">
                          Save
                        </button>
                      </form>
                      <form action={toggleRoadmapVisibility}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="is_visible" value={String(item.is_visible)} />
                        <button type="submit" className="h-7 rounded border px-2 text-xs hover:bg-muted">
                          {item.is_visible ? "Hide" : "Show"}
                        </button>
                      </form>
                      <form action={deleteRoadmapItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="h-7 rounded border px-2 text-xs text-red-600 hover:bg-red-50">
                          Del
                        </button>
                      </form>
                    </div>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
