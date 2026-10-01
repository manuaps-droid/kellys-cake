import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeHtml } from "@/lib/security/sanitizeHtml";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("titulo, extracto, seo_title, seo_description, imagen_url")
    .eq("slug", slug)
    .single();

  if (!post) return {};

  return {
    title: post.seo_title || `${post.titulo} | Kelly's Cake`,
    description: post.seo_description || post.extracto,
    openGraph: {
      title: post.seo_title || post.titulo,
      description: post.seo_description || post.extracto,
      images: post.imagen_url ? [{ url: post.imagen_url }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();
  
  const { data: post } = await supabase
    .from("blog_posts")
    .select(`
      *,
      blog_categorias(nombre)
    `)
    .eq("slug", slug)
    .single();

  if (!post) notFound();

  // JsonLd para SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.titulo,
    "image": post.imagen_url ? [post.imagen_url] : [],
    "datePublished": post.publicado_en || post.created_at,
    "dateModified": post.updated_at,
    "author": [{
        "@type": "Organization",
        "name": "Kelly's Cake",
        "url": "https://kellyscake.pe"
    }]
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <header className="mb-10 text-center">
        {post.blog_categorias && (
          <span className="text-sm font-semibold uppercase tracking-wider text-kc-rose-gold mb-4 block">
            {post.blog_categorias.nombre}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold font-playfair text-kc-charcoal mb-6 leading-tight">
          {post.titulo}
        </h1>
        <div className="text-sm text-gray-500">
          Publicado el {new Date(post.publicado_en || post.created_at).toLocaleDateString('es-PE', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </div>
      </header>

      {post.imagen_url && (
        <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-md">
          <img 
            src={post.imagen_url} 
            alt={post.titulo}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Renderizado sanitizado contra XSS */}
      <div 
        className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-kc-charcoal prose-a:text-kc-rose-gold hover:prose-a:text-kc-mocha"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.contenido) }}
      />
    </article>
  );
}
