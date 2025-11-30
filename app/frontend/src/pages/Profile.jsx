import React, { useState } from "react";
import "../styles/Profile.css";

export default function Profile() {
  const [avatar, setAvatar] = useState(null);

  const uploadPic = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <label className="avatar-upload">
          <input type="file" onChange={uploadPic} />
          <img
            src={avatar || "https://via.placeholder.com/150"}
            alt="avatar"
          />
        </label>

        <div className="profile-info">
          <h2>@gramari</h2>
          <p>TESTE</p>
        </div>
      </div>

      <h3>Publicações</h3>

      <div className="posts-grid">
        <div className="post-mini"></div>
        <div className="post-mini"></div>
        <div className="post-mini"></div>
      </div>
    </div>
  );
}
