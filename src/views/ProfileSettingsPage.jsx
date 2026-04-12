import Sans from "../components/Sans";
import { useAuth } from "../context/AuthContext";

export default function ProfileSettingsPage() {
  return (
    <main className="h-screen">
        
        {user && (
            <>
                <article className="mt-10 flex flex-col items-center">
                    <img src={Sans} alt="Profile picture"
                    className="w-[100px] h-[100px] rounded-full" />
                    <h2 className="text-2xl font-bold mt-4">{user.email}</h2>
                    <p className="text-gray-500">User ID: {user.id}</p>

                </article>
            
            
            
            </>

        )}

    </main>
  );
}
