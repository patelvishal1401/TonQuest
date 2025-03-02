import { useState, useEffect } from "react";
import { DollarSign, X } from "lucide-react";
import { supabase } from "../../services/supabase";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "../../components/Loader";
import { addViewData, getViewedData, updateRewards, updateUser } from "../../services/supabase/query";
import { useSelector } from "react-redux";
import { profileState } from "../../store/profileSlice";
import { contractInit } from "../../utils/helper";
import { useTonConnect } from "../../hooks/useTonConnect";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { Address } from "@ton/core";

const ViewTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalDataCount, setTotalDataCount] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const rowsPerPage = 10;

  const getTasksData = async (page) => {
    try {
      if (tasks.length === 0) setIsFetching(true);
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage - 1;

      const { data, error, count } = await supabase
        .from("tasks")
        .select("*", { count: "exact" })
        .range(start, end);
      setTotalDataCount(count);
      if (error) {
        console.log("Error: ", error);
      } else {
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setTasks((prevTasks) => [...prevTasks, ...data]); // Append new tasks to the existing list
        }
      }
      setIsFetching(false);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  // const getViewedTasks = () => {
  //   const viewedTasks = localStorage.getItem('viewedTasks');
  //   return viewedTasks ? JSON.parse(viewedTasks) : [];
  // };

  // const markTaskAsViewed = (taskId) => {
  //   const viewedTasks = getViewedTasks();
  //   if (!viewedTasks.includes(taskId)) {
  //     viewedTasks.push(taskId);
  //     localStorage.setItem('viewedTasks', JSON.stringify(viewedTasks));
  //   }
  // };

  useEffect(() => {
    getTasksData(currentPage);
  }, [currentPage]);

  const fetchMoreTasks = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  return (
    <div className='px-4'>
      <div className='flex-grow pb-8 space-y-8'>
        <div>
          <h2 className='text-2xl font-medium tracking-tight'>Tasks</h2>
          <p className='text-neutral-600'>View and manage your tasks here.</p>
        </div>

        {isFetching ? (
          <div className='flex items-center justify-center h-48'>
            <Loader className='text-6xl' />
          </div>
        ) : tasks.length > 0 ? (
          <div
            id='scrollableDiv'
            className='max-h-[calc(100vh-150px)] overflow-auto'
          >
            <InfiniteScroll
              dataLength={tasks.length}
              next={fetchMoreTasks}
              hasMore={tasks.length < totalDataCount}
              scrollableTarget='scrollableDiv'
            >
              {/* Task Cards */}
              <div className='grid gap-4'>
                {tasks.map((task) => (
                  <IndTask task={task} key={task?.id} />
                ))}
              </div>
            </InfiniteScroll>
          </div>
        ) : (
          <div className='flex items-center justify-center h-48'>
            <p>No Data</p>
          </div>
        )}
      </div>
      {/* Task Details Dialog */}
      {/* {selectedTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md bg-white rounded-lg">
                <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-medium">{selectedTask.taskName}</h3>
                    <button
                    onClick={handleCloseModal}
                    className="text-neutral-500 hover:text-neutral-700"
                    >
                    <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-neutral-600">Type</span>
                    <span className="font-medium capitalize">{selectedTask.type}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-neutral-600">TON Rewards</span>
                    <span className="font-medium text-purple-600">{selectedTask.tonRewards} TON</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-neutral-600">Views</span>
                    <span className="font-medium">{selectedTask.views ? selectedTask.views : 0}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-neutral-600">Total Views</span>
                    <span className="font-medium">{selectedTask.totalViews}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-neutral-600">Reward per View</span>
                    <span className="font-medium">{selectedTask.eachViewReward} TON</span>
                    </div>

                    {showVideo ? (
                    <div className="overflow-hidden bg-black rounded-lg aspect-video">
                        <video
                        controls
                        src={selectedTask.link}
                        className="object-contain w-full h-full"
                        autoPlay
                      muted
                      onEnded={()=>addViewCount(selectedTask)}
                        >
                        Your browser does not support the video tag.
                        </video>
                    </div>
                    ) : (
                    <button
                        onClick={()=> setShowVideo(true)}
                        className="block w-full py-2 mt-4 text-center text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700"
                    >
                        Open Task
                    </button>
                    )}
                </div>
                </div>
            </div>
            </div>
        )} */}
    </div>
  );
};

export default ViewTasks;

function IndTask({ task }) {
  const [selectedTask, setSelectedTask] = useState("");
  const fetchSpecificTask = async (taskId) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select()
        .eq("id", taskId);
      if (error) {
        console.log("Error: ", error);
      } else {
        setSelectedTask(data[0]);
      }
    } catch (error) {
      console.log("Error in fetching specific task: ", error);
    }
  };

  return (
    <>
      <div
        onClick={() => fetchSpecificTask(task.id)}
        className='p-4 transition-colors border rounded-lg cursor-pointer border-neutral-200 hover:bg-neutral-50'
      >
        <div className='flex items-start justify-between'>
          <div>
            <h3 className='mb-2 font-medium'>{task.taskName}</h3>
            <p className='text-sm text-neutral-600'>{task.type}</p>
          </div>
          <div className='flex items-center text-purple-600'>
            <DollarSign className='w-4 h-4 mr-1' />
            <span className='font-medium'>{task.tonRewards} TON</span>
          </div>
        </div>
      </div>
      {selectedTask && (
        <TaskModal task={selectedTask} setSelectedTask={setSelectedTask} />
      )}
    </>
  );
}

function TaskModal({ task, setSelectedTask }) {
  const [showVideo, setShowVideo] = useState(false);
  const [views, setViews] = useState(task?.views);
  const profile = useSelector(profileState);
  const { sender } = useTonConnect();
  const userFriendlyAddress = useTonAddress();
    const [tonConnectUi] = useTonConnectUI();


  const updateTaskViews = async (task) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ views: task.views + 1 })
        .eq("id", task.id)
        .select("*");
      
      const reward = await updateRewards({ rewards: task?.eachViewReward, userId: profile?.userId });
      if (error || reward?.error) {
        console.error("Error updating views:", error,reward.error);
      }
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const addViewCount = async (task) => {
      console.log(
        tonConnectUi.account.address,
        Address.parse(tonConnectUi.account.address)
      );
      
      // const completeTask = await contract
      //   .sendCompleteTask(sender, {
      //     taskId: task?.taskId,
      //     participantAddress: Address.parse(tonConnectUi.account.address),
      //   })
      //   .then((data) => console.log(data));
      // // console.log({completeTask});
    const data = { userId: profile?.userId, taskId: task?.id };
    const viewedTasks = await getViewedData(data);
    console.log(viewedTasks);
    if (viewedTasks.data && !viewedTasks.data.length) {
      const contract = contractInit();
      const completeTask = await contract.sendCompleteTask(sender, {
        taskId: task?.taskId,
        participantAddress: Address.parse(tonConnectUi.account.address),
      });
      console.log({completeTask});
      const [viewResponse, updateResponse] = await Promise.all([
        addViewData(data),
        updateTaskViews(task),
      ]);
      if (!updateResponse || !viewResponse) return;
      setViews(updateResponse[0]?.views);
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setShowVideo(false);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
      <div className='w-full max-w-md bg-white rounded-lg'>
        <div className='p-6 space-y-4'>
          <div className='flex items-start justify-between'>
            <h3 className='text-xl font-medium'>{task.taskName}</h3>
            <button
              onClick={handleCloseModal}
              className='text-neutral-500 hover:text-neutral-700'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between py-2 border-b'>
              <span className='text-neutral-600'>Type</span>
              <span className='font-medium capitalize'>{task.type}</span>
            </div>

            <div className='flex items-center justify-between py-2 border-b'>
              <span className='text-neutral-600'>Views</span>
              <span className='font-medium'>{views ? views : 0}</span>
            </div>

            <div className='flex items-center justify-between py-2 border-b'>
              <span className='text-neutral-600'>Max Participants</span>
              <span className='font-medium'>{task.maxParticipants}</span>
            </div>

            <div className='flex items-center justify-between py-2 border-b'>
              <span className='text-neutral-600'>Reward Amount</span>
              <span className='font-medium'>{task.rewardAmount} TON</span>
            </div>

            {showVideo ? (
              <div className='overflow-hidden bg-black rounded-lg aspect-video'>
                <video
                  controls
                  src={task.link}
                  className='object-contain w-full h-full'
                  autoPlay
                  muted
                  onEnded={() => addViewCount(task)}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <button
                onClick={() => setShowVideo(true)}
                className='block w-full py-2 mt-4 text-center text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700'
              >
                Open Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
