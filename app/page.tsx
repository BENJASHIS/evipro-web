interface ContentItem {
  id: string
  title: string
  sourceUrl: string
  platform: string
  category: string
  tags: string[]
  insight: string
  createdAt: string
}

export default async function Home() {
  const res = await fetch('http://localhost:3001/content', {
    cache: 'no-store'
  })

  const data: ContentItem[] = await res.json()

  return (
    <main style={{ padding: 20 }}>
      <h1>EVIPro Library</h1>

      {!data.length && <p>No hay contenido</p>}

      {data.map((item) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #ccc',
            margin: 10,
            padding: 10,
            borderRadius: 8
          }}
        >
          <h3>{item.title}</h3>
          <p><b>Categoría:</b> {item.category}</p>
          <p><b>Plataforma:</b> {item.platform}</p>

          <a href={item.sourceUrl} target="_blank">
            Ver fuente
          </a>

          <p><b>Insight:</b> {item.insight}</p>
        </div>
      ))}
    </main>
  )
}
