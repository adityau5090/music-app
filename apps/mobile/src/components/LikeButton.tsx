import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { getLikedTrackIds, toggleLike } from "../services/library.service";

interface Props {
  trackId: string;
}

export default function LikeButton({ trackId }: Props) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getLikedTrackIds()
      .then((ids) => {
        if (active) setLiked(ids.includes(trackId));
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [trackId]);

  async function handleToggle() {
    const previous = liked;
    setLiked(!previous);

    try {
      const result = await toggleLike(trackId, previous);
      setLiked(result);
    } catch (error) {
      setLiked(previous);
      console.error(error);
    }
  }

  return (
    <Pressable onPress={handleToggle} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#e11d48" />
      ) : (
        <Text style={{ color: "#e11d48", fontSize: 30 }}>
          {liked ? "♥" : "♡"}
        </Text>
      )}
    </Pressable>
  );
}
