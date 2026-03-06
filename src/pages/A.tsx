import { useState, useEffect, useCallback,} from 'react'
interface Post {
    id: number;
    title: string;
  }

function App() {
    const [count, setCount] = useState(0)
    const [data, setData] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<String | null >(null)

    useEffect(() => {

        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
                if (!res.ok) throw new Error('网络错误')
                const json = await res.json()
                setData(json)
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message); // 安全访问
                  } else {
                    setError(String(err)); // 其他类型也能处理
                  }
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const increment = useCallback(
        ()=>{
            setCount(prev => prev+1 )
        }
        ,[])

    return (
        <div>
            <h1>计数器</h1>
            <p>当前计数: {count}</p>
            <button onClick={increment}>点我+1</button>
            <h2>异步请求</h2>
            {loading && <p>加载中...</p>}
            {error && <p>错误：{error}</p>}
            {!loading && !error && (
                <ul>
                    {
                        data.map((i)=>{
                            return(
                                <li key={i.id}>{i.title}</li>
                            )
                        })
                    }
                </ul>
            )}
        </div>
    )
}

export default App
