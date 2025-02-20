import { useState } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import { useTonConnect } from "../../hooks/useTonConnect";
import { contractInit } from "../../utils/helper";
import { supabase } from "../../services/supabase";
import { BtnLoader } from "../../components/Loader";

const init = {
  taskName: "",
  type: "view",
  link: "",
  maxParticipants: '',
  rewardAmount: '',
  description: "",
};

const CreateTask = () => {
  const [loading,setLoading]=useState(false)
  const [formData, setFormData] = useState(init);
const { sender } = useTonConnect();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true)
    const contract = contractInit();
    const createTask = await contract.sendCreateTask(sender, formData);
    if (createTask)
    {
      const { error } = await supabase
        .from("tasks")
        .insert({ ...formData, taskId: createTask });
      if (error) {
        console.log("error: ", error);
      } else {
        console.log("Form submitted:", formData);
        setFormData(init)
      }
    }
    setLoading(false);

    console.log({createTask});
    
    
  };

  return (
    <div className='px-4 overflow-auto '>
      <div className='pb-8 space-y-8'>
        <div>
          <h2 className='text-2xl font-medium tracking-tight'>Create Task</h2>
          <p className='text-neutral-600'>Add a new task to your list.</p>
        </div>
        <div className='flex flex-col gap-3 p-6 bg-white border rounded-lg border-neutral-200'>
          {/* <form onSubmit={handleSubmit} className="space-y-6"> */}
          <div className='space-y-2'>
            <label
              htmlFor='taskName'
              className='block text-sm font-medium text-neutral-700'
            >
              Task Name
            </label>
            <input
              type='text'
              id='taskName'
              name='taskName'
              value={formData.taskName}
              onChange={handleChange}
              className='w-full px-3 py-2 border rounded-md border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              required
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='type'
              className='block text-sm font-medium text-neutral-700'
            >
              Type
            </label>
            <select
              id='type'
              name='type'
              value={formData.type}
              onChange={handleChange}
              className='w-full px-3 py-2 border rounded-md border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              required
            >
              <option value='view'>View</option>
              <option value='complete'>Complete the Signup</option>
            </select>
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='link'
              className='block text-sm font-medium text-neutral-700'
            >
              Link
            </label>
            <input
              type='url'
              id='link'
              name='link'
              value={formData.link}
              onChange={handleChange}
              className='w-full px-3 py-2 border rounded-md border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              required
            />
          </div>

          {/* <div className='space-y-2'>
            <label
              htmlFor='tonRewards'
              className='block text-sm font-medium text-neutral-700'
            >
              TON Rewards
            </label>
            <input
              type='number'
              id='tonRewards'
              name='tonRewards'
              value={formData.tonRewards}
              onChange={handleChange}
              className='w-full px-3 py-2 border rounded-md border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              required
            />
          </div> */}

          <div className='space-y-2'>
            <label
              htmlFor='maxParticipants'
              className='block text-sm font-medium text-neutral-700'
            >
              Max Participants
            </label>
            <input
              type='number'
              id='maxParticipants'
              name='maxParticipants'
              value={formData.maxParticipants}
              onChange={handleChange}
              className='w-full px-3 py-2 border rounded-md border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              required
            />
          </div>

          <div className='mb-6 space-y-2'>
            <label
              htmlFor='rewardAmount'
              className='block text-sm font-medium text-neutral-700'
            >
              Reward Amount
            </label>
            <input
              type='number'
              id='rewardAmount'
              name='rewardAmount'
              value={formData.rewardAmount}
              onChange={handleChange}
              className='w-full px-3 py-2 border rounded-md border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              required
            />
          </div>
          <div className='mb-6 space-y-2'>
            <label
              htmlFor='rewardAmount'
              className='block text-sm font-medium text-neutral-700'
            >
              Description
            </label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              cols={5}
              className='w-full px-3 py-2 border rounded-md resize-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              required
            />
          </div>

          <button
            type='submit'
            onClick={handleSubmit}
            className='flex items-center justify-center w-full gap-3 px-4 py-2 text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
          >
            Create Task {loading ? <BtnLoader/>:null}
          </button>
          {/* </form> */}
        </div>
      </div>
    </div>
  );
};

export default CreateTask;