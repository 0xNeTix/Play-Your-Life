/* ============================================================================
   EXEMPLE (non chargé) : adaptateur serveur pour jouer entre amis.

   Étapes pour l'activer plus tard, par exemple avec Supabase :
   1. Créer un projet Supabase, une table `profiles` (id uuid, owner uuid,
      name text, state jsonb, card jsonb, updated_at timestamptz) avec une
      politique RLS « owner = auth.uid() » en écriture, et un bucket privé
      `photos`.
   2. Charger le SDK et ce fichier dans index.html, avant app.js.
   3. Appeler Store.use(RemoteAdapter) puis App.init() une fois connecté.

   La colonne `card` contient la carte publique (Engine.publicCard) : c'est
   la seule chose que les amis du groupe peuvent lire. Les photos et le
   détail de l'historique restent privés.
   ========================================================================== */

/* global supabase */
const RemoteAdapter = {
  async listProfiles() {
    const { data } = await supabase.from('profiles').select('id, name, created_at');
    return (data || []).map(p => ({ id: p.id, name: p.name, createdAt: Date.parse(p.created_at) }));
  },
  async loadState(id) {
    const { data } = await supabase.from('profiles').select('state').eq('id', id).single();
    return data ? data.state : null;
  },
  async saveState(id, state) {
    await supabase.from('profiles').upsert({ id, name: state.profile?.name, state, card: Engine.publicCard(state), updated_at: new Date().toISOString() });
  },
  async deleteProfile(id) {
    await supabase.from('profiles').delete().eq('id', id);
  },
  async putPhoto(profileId, id, dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();
    await supabase.storage.from('photos').upload(`${profileId}/${id}.jpg`, blob, { upsert: true });
  },
  async getPhoto(id) { /* à implémenter : URL signée du bucket */ return null; },
  async delPhoto(id) { /* à implémenter */ },
  async allPhotos(profileId) { return []; },
  getActive: () => localStorage.getItem('pyl.active'),
  setActive: id => localStorage.setItem('pyl.active', id),
};
