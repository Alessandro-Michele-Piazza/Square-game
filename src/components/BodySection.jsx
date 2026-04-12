import { FaHeart, FaRegHeart } from "react-icons/fa6";
import supabase from "../database/supabase";
import { useState } from "react";

export default function BodySection( {profile_id, game} ) {

    const [isFavorite, setIsFavorite] = useState(false);
    const add_game = async () => {
       const {data,error} = await supabase
       .from("favorites")
       .insert([{profile_id, game_id: game.id, game_name: game.name}])
       .select();
       setIsFavorite(true);
    };


  return (
    <section className="mt-12">
      <div className="col-span-5 flex flex-col items-center">
        <p className="text-white text-xl mb-5">Reviews</p>
        <textarea
          className="textarea w-1/2"
          placeholder="Inserisci la tua recensione..."
        ></textarea>
      </div>
      <div>
        {isFavorite ? (
          <FaHeart className="text-3xl text-red-500 cursor-pointer" onClick={add_game} />
        ) : (
          <FaRegHeart className="text-3xl text-red-500 cursor-pointer" onClick={add_game} />
        )}
      </div>
    </section>
  );
}
