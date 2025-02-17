import React, {useState} from 'react'
import TabNavigation from './TabNavigation'

const LayoutWrapper = ({children}) => {
    const [activeTab, setActiveTab] = useState("");
  return (
    <div className=" bg-neutral-50">
      <main className="pb-16">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-in-out">
          {children}
        </div>
      </main>
      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default LayoutWrapper