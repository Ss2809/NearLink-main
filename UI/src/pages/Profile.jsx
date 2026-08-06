import Navbar from "../components/Navbar";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import RecentActivity from "../components/profile/RecentActivity";
import { useState } from "react";
import EditProfileModal from "../components/profile/EditProfileModal";


function Profile() {
  const [openEdit, setOpenEdit] = useState(false);
  
  return (
    <>
      <Navbar />

      <section className="max-w-6xl mx-auto px-6 py-8">
        <ProfileHeader setOpenEdit={setOpenEdit} />

        <ProfileStats />
        <RecentActivity />
       <EditProfileModal
  open={openEdit}
  setOpen={setOpenEdit}
/>
      </section>
    </>
  );
}

export default Profile;
