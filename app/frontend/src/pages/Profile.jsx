import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import "../styles/Profile.css";

const getImageUrl = (filename) => {
  if (!filename) return null;
  const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, "") : "";
  return `${base}/uploads/${filename}`;
};

export default function Profile() {
  const { user } = useAuth();
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (user) {
      const isOwn = !username || username === user.username;
      setIsOwnProfile(isOwn);
      fetchProfile();
      if (!isOwn) {
        checkFollowStatus();
      }
    }
  }, [user, username]);

  useEffect(() => {
    if ((isOwnProfile && user) || (!isOwnProfile && profileData)) {
      fetchPosts();
      fetchStats();
    }
  }, [isOwnProfile, user, profileData]);

  const fetchProfile = async () => {
    try {
      if (isOwnProfile) {
        const res = await api.get("/user/profile");
        setProfileData(res.data.user);
        setBio(res.data.user.bio || "");
      } else {
        const res = await api.get(`/user/${username}`);
        setProfileData(res.data.user);
      }
      setProfileLoaded(true);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfileLoaded(true); // Still set to true to avoid infinite loading
    }
  };

  const fetchPosts = async () => {
    try {
      const userId = isOwnProfile ? user.id : profileData?.id;
      if (userId) {
        const res = await api.get(`/posts/user/${userId}`);
        setPosts(res.data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      setPostsLoaded(true);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveChanges = async () => {
    try {
      let avatarUrl = profileData.avatar;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        avatarUrl = uploadRes.data.filename;
      }

      await api.put("/user/update", {
        bio,
        avatar: avatarUrl,
      });

      setProfileData({ ...profileData, bio, avatar: avatarUrl });
      setEditing(false);
      setAvatarFile(null);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/posts/${postId}`);
        setPosts(posts.filter((p) => p.id !== postId));
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  const handleBuy = async (postId) => {
    try {
      await api.post(`/produtos/purchase/${postId}`);
      alert("Compra realizada com sucesso!");
    } catch (err) {
      console.error("Error buying product:", err);
      alert("Erro ao comprar produto.");
    }
  };



  const uploadAvatar = async () => {
    if (!avatarFile) return;

    try {
      const formData = new FormData();
      formData.append("file", avatarFile);
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const avatarUrl = uploadRes.data.filename;

      await api.put("/user/update", { avatar: avatarUrl });
      setProfileData({ ...profileData, avatar: avatarUrl });
      setAvatarFile(null);
    } catch (err) {
      console.error("Error uploading avatar:", err);
      alert("Failed to upload avatar. Please try again.");
    }
  };

  const checkFollowStatus = async () => {
    try {
      const res = await api.get(`/user/following`);
      const isFollowing = res.data.following.some(followedUser => followedUser.username === username);
      setIsFollowing(isFollowing);
    } catch (err) {
      console.error("Error checking follow status:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const userId = isOwnProfile ? user.id : profileData?.id;
      if (userId) {
        const followersRes = await api.get(`/user/followers?user_id=${userId}`);
        const followingRes = await api.get(`/user/following?user_id=${userId}`);
        setStats({
          posts: posts.length,
          followers: followersRes.data.followers.length,
          following: followingRes.data.following.length
        });
        setFollowers(followersRes.data.followers);
        setFollowing(followingRes.data.following);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.post(`/user/unfollow/${username}`);
        setIsFollowing(false);
      } else {
        await api.post(`/user/follow/${username}`);
        setIsFollowing(true);
      }
      // Refresh stats after follow/unfollow
      fetchStats();
    } catch (err) {
      console.error("Error following/unfollowing user:", err);
      alert("Failed to follow/unfollow user. Please try again.");
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      // Refresh posts to update like count
      fetchPosts();
    } catch (err) {
      console.error("Error liking post:", err);
      alert("Failed to like post. Please try again.");
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    try {
      await api.post(`/posts/${postId}/comments`, { conteudo: commentText });
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment. Please try again.");
    }
  };

  const toggleComments = (postId) => {
    if (!comments[postId]) {
      fetchComments(postId);
    } else {
      setComments(prev => ({ ...prev, [postId]: null }));
    }
  };

  if (!profileLoaded || !postsLoaded) return <div>Loading...</div>;

  const normalPosts = posts.filter(p => p.tipo !== "product");
  const products = posts.filter(p => p.tipo === "product");

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover">
          {/* Cover photo area - can be customized later */}
        </div>
        <div className="profile-main">
          <div className="profile-avatar-section">
            {isOwnProfile ? (
              <label className="avatar-upload">
                <input type="file" onChange={handleAvatarChange} />
                <img
                  src={avatarError ? "https://via.placeholder.com/200" : (getImageUrl(profileData?.avatar) || "https://via.placeholder.com/200")}
                  alt="avatar"
                  className="profile-avatar"
                  onError={() => setAvatarError(true)}
                />
                {avatarFile && (
                  <button onClick={uploadAvatar} className="upload-avatar-btn">Upload</button>
                )}
              </label>
            ) : (
              <img
                src={avatarError ? "https://via.placeholder.com/200" : (getImageUrl(profileData?.avatar) || "https://via.placeholder.com/200")}
                alt="avatar"
                className="profile-avatar"
                onError={() => setAvatarError(true)}
              />
            )}
          </div>

          <div className="profile-info-section">
            <h1 className="profile-username">@{profileData?.username}</h1>

            <div className="profile-bio">
              {editing ? (
                <div className="edit-bio-section">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a bio..."
                    className="bio-textarea"
                  />
                  <div className="edit-actions">
                    <button onClick={saveChanges} className="save-btn">Save</button>
                    <button onClick={() => setEditing(false)} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <p>{profileData?.bio || "No bio yet."}</p>
              )}
            </div>

            {isOwnProfile ? (
              <button
                className="edit-profile-btn"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <button
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">{posts.length}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.followers}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.following}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          Followers
        </button>
        <button
          className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
      </div>

      {/* Content Area */}
      <div className="profile-content">
        {activeTab === 'posts' && (
          <div className="posts-list">
            {normalPosts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet. Create your first post!</p>
              </div>
            ) : (
              normalPosts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
                    {isOwnProfile && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="delete-post-btn"
                        title="Delete post"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="social-post">
                    {post.image ? (
                      <>
                        <p className="post-content">{post.content}</p>
                        <img src={getImageUrl(post.image)} alt="post" className="post-image" />
                      </>
                    ) : (
                      <p className="post-content">{post.content}</p>
                    )}
                    <div className="post-actions">
                      <button onClick={() => handleLike(post.id)} className="like-btn">
                        ❤️ {post.likes || 0}
                      </button>
                      <button onClick={() => toggleComments(post.id)} className="comment-btn">
                        💬 {post.comments_count || 0}
                      </button>
                    </div>
                    {comments[post.id] && (
                      <div className="comments-section">
                        {comments[post.id].map((comment) => (
                          <div key={comment.id} className="comment">
                            <strong>@{comment.username}:</strong> {comment.conteudo}
                          </div>
                        ))}
                        <div className="comment-input">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                          />
                          <button onClick={() => handleCommentSubmit(post.id)}>Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="posts-grid">
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products yet. Create your first product!</p>
              </div>
            ) : (
              products.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
                    {isOwnProfile && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="delete-post-btn"
                        title="Delete post"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="product-post">
                    <h4>{post.titulo}</h4>
                    <p className="product-description">{post.descricao}</p>
                    <div className="product-details">
                      <span className="product-price">R$ {post.preco?.toFixed(2)}</span>
                      <span className="product-category">{post.categoria}</span>
                    </div>
                    {post.image && (
                      <img src={getImageUrl(post.image)} alt="product" className="post-image" />
                    )}
                    {post.content && <p className="post-content">{post.content}</p>}
                    <button onClick={() => handleBuy(post.id)} className="buy-btn">
                      Comprar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="followers-list">
            {followers.length === 0 ? (
              <div className="empty-state">
                <p>No followers yet.</p>
              </div>
            ) : (
              followers.map((follower) => (
                <Link key={follower.id} to={`/profile/${follower.username}`} className="follower-item">
                  <img
                    src={getImageUrl(follower.avatar)}
                    alt=""
                    className="follower-avatar"
                  />
                  <div className="follower-info">
                    <span className="follower-username">@{follower.username}</span>
                    <span className="follower-name">{follower.name}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="following-list">
            {following.length === 0 ? (
              <div className="empty-state">
                <p>Not following anyone yet.</p>
              </div>
            ) : (
              following.map((user) => (
                <Link key={user.id} to={`/profile/${user.username}`} className="following-item">
                  <img
                    src={getImageUrl(user.avatar)}
                    alt=""
                    className="following-avatar"
                  />
                  <div className="following-info">
                    <span className="following-username">@{user.username}</span>
                    <span className="following-name">{user.name}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
