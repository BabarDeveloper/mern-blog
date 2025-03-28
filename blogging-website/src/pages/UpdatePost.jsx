import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UpdatePost() {
  const [file, setFile] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(0);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(null);
  const { postId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    category: "uncategorized",
    image: "", // Changed from profilePicture to image
    content: "",
  });
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        if (!res.ok) {
          setPublishError(data.message);
          return;
        }
        if (res.ok) {
          setPublishError(null);
          setFormData({
            ...data.posts[0],
            // Ensure we're using the correct field name
            image: data.posts[0].image || data.posts[0].profilePicture || ""
          });
          setImageFileUrl(data.posts[0].image || data.posts[0].profilePicture);
        }
      } catch (error) {
        setPublishError("Failed to fetch post data");
      }
    };
    fetchPost();
  }, [postId]);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageFileUploadError("Please select an image");
        return;
      }

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setImageFileUploadError('Please select an image file (JPEG, PNG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setImageFileUploadError('File size must be less than 5MB');
        return;
      }

      setImageFileUploadProgress(0);
      setImageFileUploadError(null);

      const formDataForUpload = new FormData();
      formDataForUpload.append("file", file);
      formDataForUpload.append("upload_preset", "mern_blog");
      formDataForUpload.append("cloud_name", "babarali");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/babarali/image/upload",
        formDataForUpload,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setImageFileUploadProgress(progress);
          },
        }
      );

      const downloadURL = res.data.secure_url;
      setImageFileUrl(downloadURL);
      setImageFileUploadProgress(100);
      setFormData(prev => ({
        ...prev,
        image: downloadURL // Using correct field name
      }));
    } catch (error) {
      console.error("Image upload failed", error);
      setImageFileUploadError(
        error.response?.data?.message || "Image upload failed. Please try again."
      );
      setImageFileUploadProgress(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure we have all required fields
      if (!formData.title || !formData.content) {
        setPublishError("Title and content are required");
        return;
      }

      const res = await fetch(
        `/api/post/updatepost/${formData._id}/${currentUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to update post");
      }

      setPublishError(null);
      setPublishSuccess("Post updated successfully!");
      setTimeout(() => navigate(`/post/${data.slug}`), 1500);
      
    } catch (error) {
      setPublishError(error.message);
      setPublishSuccess(null);
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update Post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <Select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="uncategorized">Select a category</option>
            <option value="javascript">JavaScript</option>
            <option value="reactjs">React.js</option>
            <option value="nextjs">Next.js</option>
          </Select>
        </div>
        
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={imageFileUploadProgress}
          >
            {imageFileUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageFileUploadProgress}
                  text={`${imageFileUploadProgress || 0}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        
        {imageFileUploadProgress > 0 && imageFileUploadProgress < 100 && (
          <p className="text-center text-blue-500">
            Uploading: {imageFileUploadProgress}%
          </p>
        )}
        
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        
        {imageFileUrl && (
          <img
            src={imageFileUrl}
            alt="Post preview"
            className="w-full h-72 object-cover"
          />
        )}
        
        <ReactQuill
          theme="snow"
          value={formData.content}
          onChange={(value) => setFormData({...formData, content: value})}
          className="h-72 mb-12"
          required
        />
        
        <Button type="submit" gradientDuoTone="purpleToPink">
          Update Post
        </Button>
        
        {publishError && (
          <Alert color="failure" className="mt-5">
            {publishError}
          </Alert>
        )}
        
        {publishSuccess && (
          <Alert color="success" className="mt-5">
            {publishSuccess}
          </Alert>
        )}
      </form>
    </div>
  );
}