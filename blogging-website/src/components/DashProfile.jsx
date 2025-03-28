import { Button, TextInput, Alert, Modal } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CircularProgressbar } from "react-circular-progressbar";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from "react-router-dom";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from "../redux/user/userSlice";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";

export default function DashProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setImageFileUploadError('Please select an image file (JPEG, PNG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setImageFileUploadError('File size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
      setImageFileUploadError(null);
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    try {
      setImageFileUploadProgress(0);
      setImageFileUploadError(null);
      
      const formDataForUpload = new FormData();
      formDataForUpload.append("file", imageFile);
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
      
      // Update formData with the new profile picture URL
      setFormData(prev => ({
        ...prev,
        profilePicture: downloadURL
      }));
      
      // Immediately update the Redux store with the new image
      dispatch(updateSuccess({ 
        ...currentUser, 
        profilePicture: downloadURL 
      }));

      setUpdateUserSuccess("Profile picture uploaded successfully!");
      
    } catch (error) {
      console.error("Image upload failed:", error);
      setImageFileUploadError(
        error.response?.data?.message || "Image upload failed. Please try again."
      );
      setImageFileUploadProgress(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // If only image was changed and no other fields
      if (Object.keys(formData).length === 0) {
        return;
      }

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
        throw new Error(data.message || "Failed to update profile");
      }

      dispatch(updateSuccess(data));
      setUpdateUserSuccess("Profile updated successfully!");
      setUpdateUserError(null);
      setFormData({});
      
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
      setUpdateUserSuccess(null);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete account");
      }
      dispatch(deleteUserSuccess());
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.message);
        return;
      }
      dispatch(signoutSuccess());
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
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
                  stroke: `rgba(62, 152, 199, ${imageFileUploadProgress / 100})`,
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
          <Alert color="failure" className="mt-2">
            {imageFileUploadError}
          </Alert>
        )}
        {updateUserSuccess && (
          <Alert color="success" className="mt-2">
            {updateUserSuccess}
          </Alert>
        )}
        {updateUserError && (
          <Alert color="failure" className="mt-2">
            {updateUserError}
          </Alert>
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
        
        <Button
          type="submit"
          gradientDuoTone="purpleToBlue"
          outline
          disabled={imageFileUploadProgress !== null && imageFileUploadProgress < 100}
        >
          Update Profile
        </Button>
        
        {currentUser.isAdmin && (
          <Link to="/create-post">
            <Button
              type="button"
              gradientDuoTone="purpleToPink"
              className="w-full"
            >
              Create a post
            </Button>
          </Link>
        )}
      </form>
      
      <div className="text-red-500 flex justify-between mt-5">
        <span 
          onClick={() => setShowModal(true)} 
          className="cursor-pointer hover:underline"
        >
          Delete Account
        </span>
        <span 
          onClick={handleSignout} 
          className="cursor-pointer hover:underline"
        >
          Sign Out
        </span>
      </div>
      
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}