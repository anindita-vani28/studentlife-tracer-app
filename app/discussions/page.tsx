'use client'

import { useState, useEffect } from 'react'
import { getDiscussionPosts, createDiscussionPost, getDiscussionComments, createDiscussionComment } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'

export default function DiscussionsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [selectedPost, setSelectedPost] = useState<any | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPostData, setNewPostData] = useState({ title: '', description: '', tags: '' })
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    try {
      const data = await getDiscussionPosts()
      setPosts(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleNewPost(e: React.FormEvent) {
    e.preventDefault()
    try {
      const tags = newPostData.tags.split(',').map(t => t.trim()).filter(Boolean)
      await createDiscussionPost(newPostData.title, newPostData.description, tags)
      setNewPostData({ title: '', description: '', tags: '' })
      setShowNewPostForm(false)
      await loadPosts()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSelectPost(post: any) {
    setSelectedPost(post)
    const postComments = await getDiscussionComments(post.id)
    setComments(postComments)
  }

  async function handleNewComment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPost || !newComment.trim()) return
    try {
      await createDiscussionComment(selectedPost.id, newComment)
      setNewComment('')
      const updated = await getDiscussionComments(selectedPost.id)
      setComments(updated)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="discussions" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Discussions</h1>
            <p className="text-gray-600 mt-2">Share ideas, ask questions, help each other learn</p>
          </div>
          <button onClick={() => setShowNewPostForm(!showNewPostForm)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {showNewPostForm ? 'Cancel' : '+ New Discussion'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {showNewPostForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Start a New Discussion</h2>
                <form onSubmit={handleNewPost} className="space-y-4">
                  <input type="text" placeholder="Discussion title..." required value={newPostData.title} onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })} className="w-full p-3 border rounded-lg" />
                  <textarea placeholder="Your message..." required value={newPostData.description} onChange={(e) => setNewPostData({ ...newPostData, description: e.target.value })} rows={4} className="w-full p-3 border rounded-lg" />
                  <input type="text" placeholder="Tags (comma-separated, e.g., Internships, Programming)" value={newPostData.tags} onChange={(e) => setNewPostData({ ...newPostData, tags: e.target.value })} className="w-full p-3 border rounded-lg" />
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">Post Discussion</button>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">Loading discussions...</div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center"><h3 className="text-lg font-semibold text-gray-900">No discussions yet</h3><p className="text-gray-600">Be the first to start a discussion!</p></div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} onClick={() => handleSelectPost(post)} className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition ${selectedPost?.id === post.id ? 'ring-2 ring-blue-500' : ''}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{post.description.substring(0, 150)}...</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {post.tags.map((tag: string) => (<span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{tag}</span>))}
                      </div>
                      <span className="text-sm text-gray-500">{post.view_count} views</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {selectedPost ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">{selectedPost.title}</h2>
                <p className="text-gray-700 mb-4">{selectedPost.description}</p>
                <div className="mb-6 pb-6 border-b">
                  <p className="text-sm text-gray-500">Comments: {comments.length}</p>
                </div>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-800 text-sm">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-2">👍 {comment.upvotes}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleNewComment} className="space-y-2">
                  <textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} className="w-full p-2 border rounded-lg text-sm" />
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">Comment</button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">Select a discussion to view comments</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
