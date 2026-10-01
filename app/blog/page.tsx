import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import PageHeader from "@/components/common/PageHeader";

// Por ahora usaremos el admin client para no complicar el RLS si aún no se refresca
export default async function BlogIndexPage() {
  const supabase = createAdminClient();
  
  const { data: posts } = await supabase
    .from("blog_posts")
    .select(`
      id, titulo, slug, extracto, imagen_url, publicado_en,
      blog_categorias(nombre)
    `)
    .eq("estado", "publicado")
    .order("publicado_en", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader 
        title="Nuestro Blog"
        description="Tips, tendencias y consejos sobre pastelería y celebraciones."
      />

      {(!posts || posts.length === 0) ? (
        <div className="text-center py-20 text-gray-500">
          Pronto publicaremos nuestros primeros artículos. ¡Mantente atento!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {posts.map((post: any) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                {post.imagen_url && (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                    <img 
                      src={post.imagen_url} 
                      alt={post.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  {post.blog_categorias && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-kc-rose-gold mb-2 block">
                      {post.blog_categorias.nombre}
                    </span>
                  )}
                  <h3 className="text-xl font-bold font-playfair text-kc-charcoal mb-3 group-hover:text-kc-rose-gold transition-colors">
                    {post.titulo}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {post.extracto}
                  </p>
                  <div className="text-xs text-gray-400">
                    {new Date(post.publicado_en || post.created_at).toLocaleDateString('es-PE', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
