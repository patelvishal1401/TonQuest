import { supabase } from ".";

const addUser = async (data) =>
  await supabase.from("users").insert(data).select();

const updateUser = async ({ data, userId }) =>
  await supabase.from("users").update(data).eq("userId", userId).select('*');

const updateRewards = async ({ rewards, userId }) => {
  const userInfo = await getUser(userId);
  return await supabase.from("users").update({rewards:userInfo?.data?.[0]?.rewards+rewards}).eq("userId", userId).select('*');

}

const getUser = async (userId) =>
    await supabase.from("users").select("*").eq("userId", userId);


const getViewedData = async ({userId,taskId}) => await supabase
    .from("video_views")
    .select("*")
    .eq("userId", userId)
    .eq("taskId", taskId);

const addViewData = async (data) => await supabase
    .from("video_views")
    .insert(data).select();

export { addUser, updateUser, getUser, getViewedData, addViewData, updateRewards };
