import React from 'react'

const checkBox = ({ toolName, handleOnChange, checked }) => {
  return (
    <div className="flex items-center px-3 justify-between bg-gray-300 dark:bg-[#141539] text-[#141539] dark:text-white">
      <label className="font-semibold ">{toolName}</label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={handleOnChange}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-[#141539] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#141539] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  )
}

export default checkBox