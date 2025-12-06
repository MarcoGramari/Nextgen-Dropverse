import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "../styles/Profile.css";

const getImageUrl = (filename) => {
  if (!filename) return null;
  const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, "") : "";
  return `${base}/uploads/${filename}`;
};

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/profile");
      setProfileData(res.data.user);
      setBio(res.data.user.bio || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/posts/user/${user.id}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-section">
          <label className="avatar-upload">
            <input type="file" onChange={handleAvatarChange} />
            <img
              src={getImageUrl(profileData?.avatar) || "https://via.placeholder.com/150"}
              alt="avatar"
            />
            {avatarFile && (
              <button onClick={uploadAvatar} className="upload-btn">Upload Avatar</button>
            )}
          </label>
        </div>

        <div className="profile-info">
          <h2>@{profileData?.username}</h2>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter your bio..."
            />
          ) : (
            <p>{profileData?.bio || "No bio yet."}</p>
          )}
          {editing ? (
            <div>
              <button onClick={saveChanges}>Save</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>



      <h3>Your Posts</h3>

      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <p className="post-date">{new Date(post.created_at).toLocaleString()}</p>
            {post.tipo === "product" ? (
              <div className="product-post">
                <h3>{post.titulo}</h3>
                <p>{post.descricao}</p>
                <p><strong>R$ {post.preco?.toFixed(2)}</strong></p>
                <p>Categoria: {post.categoria}</p>
                {post.image && <img src={getImageUrl(post.image)} alt="post" />}
                {post.content && <p>{post.content}</p>}
                <button onClick={() => handleBuy(post.id)}>Comprar</button>
                <button onClick={() => deletePost(post.id)}>Delete</button>
              </div>
            ) : (
              <>
                {post.image && <img src={getImageUrl(post.image)} alt="post" />}
                <p>{post.content}</p>
                <button onClick={() => deletePost(post.id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
