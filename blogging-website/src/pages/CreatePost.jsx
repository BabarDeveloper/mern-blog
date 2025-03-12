import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(0);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "uncategorized",
    profilePicture: "",
    content: "",
  });

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageFileUploadError("Please select an image");
        return;
      }

      setImageFileUploadProgress(0); // Reset progress
      setImageFileUploadError(null); // Reset error

      const formDataForUpload = new FormData();
      formDataForUpload.append("file", file);
      formDataForUpload.append("upload_preset", "mern_blog"); // Replace with your Cloudinary preset
      formDataForUpload.append("cloud_name", "babarali"); // Replace with your Cloudinary cloud name

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/babarali/image/upload",
        formDataForUpload,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setImageFileUploadProgress(progress); // Update progress
          },
        }
      );

      const downloadURL = res.data.secure_url; // Get the uploaded image URL
      setImageFileUrl(downloadURL); // Set uploaded image URL
      setImageFileUploadProgress(100); // Mark upload as complete

      // Update formData with the new profile picture URL
      setFormData((prevFormData) => ({
        ...prevFormData,
        profilePicture: downloadURL,
      }));
    } catch (error) {
      console.error("Image upload failed", error);
      setImageFileUploadError("Image upload failed. Please try again."); // Set error message
      setImageFileUploadProgress(null); // Reset progress on error
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // You can now send the formData to your backend or perform any other action
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create a post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
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
        {imageFileUploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${imageFileUploadProgress}%` }}
            ></div>
          </div>
        )}
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        {imageFileUrl && (
          <img
            src={imageFileUrl}
            alt="Uploaded"
            className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill
          theme="snow"
          value={description}
          onChange={(value) => {
            setDescription(value);
            setFormData({ ...formData, content: value });
          }}
          className="h-72 mb-12"
          required
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
      </form>
    </div>
  );
}
