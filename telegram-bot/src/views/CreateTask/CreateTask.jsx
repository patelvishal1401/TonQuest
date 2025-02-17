import { useState } from "react";
import { supabase } from "../../services/supabase";

const CreateTask = () => {
  const [formData, setFormData] = useState({
    taskName: "",
    type: "view",
    link: "",
    tonRewards: "",
    totalViews: "",
    eachViewReward: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    const { error } = await supabase
                                .from("tasks")
                                .insert(formData);
    if(error){
        console.log("error: ", error);
    }else{
        console.log("Form submitted:", formData);
    }
  };

  return (
    <div className=" px-4 overflow-auto">
      <div className="space-y-8 pb-8">
        <div>
          <h2 className="text-2xl font-medium tracking-tight">Create Task</h2>
          <p className="text-neutral-600">Add a new task to your list.</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="taskName" className="block text-sm font-medium text-neutral-700">
                Task Name
              </label>
              <input
                type="text"
                id="taskName"
                name="taskName"
                value={formData.taskName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-neutral-700">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="view">View</option>
                <option value="complete">Complete the Signup</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="link" className="block text-sm font-medium text-neutral-700">
                Link
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tonRewards" className="block text-sm font-medium text-neutral-700">
                TON Rewards
              </label>
              <input
                type="number"
                id="tonRewards"
                name="tonRewards"
                value={formData.tonRewards}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="totalViews" className="block text-sm font-medium text-neutral-700">
                Total Views
              </label>
              <input
                type="number"
                id="totalViews"
                name="totalViews"
                value={formData.totalViews}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="eachViewReward" className="block text-sm font-medium text-neutral-700">
                Each View Reward
              </label>
              <input
                type="number"
                id="eachViewReward"
                name="eachViewReward"
                value={formData.eachViewReward}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Create Task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;