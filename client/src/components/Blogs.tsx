import { useEffect, useRef, useState } from "react"
import { getBlogs, getRecommendedBlogs } from "../api/index"
import { Category, BlogShortType, UserType } from "../definitions"
import { useAppSelector } from "../hooks.tsx"
import { useSearchParams } from "react-router-dom"

import BlogCard from "./BlogCard"

const Blogs = () => {
  const [blogs, setBlogs] = useState<BlogShortType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const limit = 10

  const [searchParams] = useSearchParams()
  const category = searchParams.get("category") || "all"
  console.log(category)

  const {
    loading: userLoading,
    isAuthenticated,
    user,
  } = useAppSelector((state) => state.user)

  const fetchBlogs = async (userId: UserType["userId"] | undefined) => {
    setLoading(true)
    try {
      const response =
        category === Category.All && userId
          ? await getRecommendedBlogs(userId, page, limit)
          : await getBlogs(category.toString(), page, limit)

      const newBlogs = response.data.blogs
      setBlogs((prevBlogs) => [...prevBlogs, ...newBlogs])
      setPage((prevPage) => prevPage + 1)
    } catch (error: any) {
      console.error(error.response)
      // Handle error
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!containerRef.current) return

    const handleScroll = () => {
      if (
        containerRef.current &&
        containerRef.current.scrollHeight - containerRef.current.scrollTop ===
          containerRef.current.clientHeight
      ) {
        fetchBlogs(user?.userId)
      }
    }

    containerRef.current.addEventListener("scroll", handleScroll)
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", handleScroll)
      }
    }
  }, [fetchBlogs])

  useEffect(() => {
    if (userLoading) return
    fetchBlogs(user?.userId)
    setBlogs([])
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, , userLoading, isAuthenticated])

  return (
    <div
      ref={containerRef}
      style={{ overflowY: "auto", height: "calc(100vh-120px)" }}
      className="contain"
    >
      {blogs.map((blog, index) => (
        <BlogCard key={index} blog={blog} />
      ))}
      {loading && (
        <div
          role="status"
          className=" pr-5 my-6 mr-8 animate-pulse md:space-y-0  rtl:space-x-reverse md:flex flex-row-reverse md:items-center justify-between"
        >
          <div className="flex items-center justify-center w-full h-40 mt-4 bg-gray-300 rounded-md sm:w-96 ">
            <svg
              className="w-10 h-10 text-gray-200 "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 18"
            >
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
            </svg>
          </div>
          <div className="w-full">
            <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-2.5 w-4/5"></div>
            <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full max-w-[460px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full max-w-[360px]"></div>
          </div>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      <style>
        {`
        .contain {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .contain::-webkit-scrollbar { 
          display: none;  /* Safari and Chrome */
        }`}
      </style>
    </div>
  )
}

export default Blogs
