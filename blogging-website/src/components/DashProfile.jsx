import { Button, TextInput, Alert } from "flowbite-react"; // Import Alert
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";
import {
  updateStart,
  updateSuccess,
  updateFailure,
} from "../redux/user/userSlice";

export default function DashProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null); // State for image upload error
  const [formData, setFormData] = useState({});
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null); // State for user update success
  const [updateUserError, setUpdateUserError] = useState(null); // State for user update error
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file)); // Preview before upload
      setImageFileUploadError(null); // Reset any previous error
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploadProgress(0); // Reset progress
    setImageFileUploadError(null); // Reset error
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "mern_blog"); // Replace with Cloudinary preset
    formData.append("cloud_name", "babarali"); // Replace with your Cloudinary cloud name

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/babarali/image/upload",
        formData,
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made")
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message); // Set user update error
        setUpdateUserSuccess(null); // Reset success message
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User profile updated successfully!"); // Set success message
        setUpdateUserError(null); // Reset error message
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message); // Set user update error
      setUpdateUserSuccess(null); // Reset success message
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl ">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress !== null && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadProgress / 100
                  })`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full border-8 object-cover border-[lightgray] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              "opacity-60"
            }`}
          />
        </div>
        {imageFileUploadProgress > 0 && imageFileUploadProgress < 100 && (
          <p className="text-center text-blue-500">
            Uploading: {imageFileUploadProgress}%
          </p>
        )}
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert> // Image upload error alert
        )}
        {updateUserSuccess && (
          <Alert color="success">{updateUserSuccess}</Alert> // User update success alert
        )}
        {updateUserError && (
          <Alert color="failure">{updateUserError}</Alert> // User update error alert
        )}
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <TextInput
          type="password"
          id="password"
          placeholder="password"
          onChange={handleChange}
        />
        <Button type="submit" gradientDuoTone="purpleToBlue" outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span className="cursor-pointer">Delete Account</span>
        <span className="cursor-pointer">Sign Out</span>
      </div>
    </div>
  );
}