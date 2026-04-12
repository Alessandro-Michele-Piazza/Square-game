import { useContext } from "react";
import { UserContext } from "../context/user-context";
import Sans from "../assets/sans.png";


export default function ProfilePage() {
  const { user, profile } = useContext(UserContext);

  return (
    <main className="h-screen">
      {user && profile && (
        <>
          <article className="mt-10 flex flex-col items-center">
            <img
              src={Sans}
              alt="Profile avatar"
              className="w-[100px] h-[100px] rounded-full object-cover"
            />
            <h2 className="text-2xl font-bold text-white mt-5">
              {profile?.username || "User"}
            </h2>
          </article>

			<section className="mt-10 px-4">
				<h3 className="text-xl font-semibold text-white mb-4">Your Profile</h3>
				<div className="bg-[#1e293b]/80 rounded-lg p-6">
					<p className="text-gray-300 mb-2"><span className="font-medium text-white">Email:</span> {user.email}</p>
					<p className="text-gray-300 mb-2"><span className="font-medium text-white">First Name:</span> {profile?.first_name || "N/A"}</p>
					<p className="text-gray-300 mb-2"><span className="font-medium text-white">Last Name:</span> {profile?.last_name || "N/A"}</p>
					<p className="text-gray-300"><span className="font-medium text-white">Username:</span> {profile?.username || "N/A"}</p>
				</div>
			</section>


        </>
      )}
    </main>
  );
}
