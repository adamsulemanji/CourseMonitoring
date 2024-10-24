import React, { useState } from 'react';
import classnames from 'classnames';

function ClassCard({ classObj = {}, onSave, onCancel, onDelete }) {
    // Determine if this is a new class or an existing class based on the presence of classObj._id
    const isEditMode = !!classObj._id;
    const [classData, setClassData] = useState({
        crn: '',
        semester: 'Spring',
        year: new Date().getFullYear(),
        ...classObj, // If it's edit mode, use the classObj data
    });

    // Update the state as the user changes form input
    const handleChange = e => {
        const { name, value } = e.target;
        setClassData({
            ...classData,
            [name]: value,
        });
    };

    // Save the new or edited class
    const handleSave = () => {
        onSave(classData);
    };

    // Determine button labels and form behavior based on mode
    return (
        <div
            className={classnames(
                'w-full max-w-4xl p-6 bg-white rounded-lg shadow mb-4',
                {
                    'bg-green-50': classData.isOpen,
                    'bg-red-50': !classData.isOpen && isEditMode,
                }
            )}
        >
            <div className="mb-4 text-lg font-semibold text-gray-700">
                {isEditMode ? 'Edit Class' : 'Add New Class'}
            </div>
            <form className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                    <label
                        htmlFor="crn"
                        className="block mb-2 text-sm font-medium text-gray-900"
                    >
                        CRN
                    </label>
                    <input
                        type="number"
                        name="crn"
                        id="crn"
                        value={classData.crn}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <label
                        htmlFor="semester"
                        className="block mb-2 text-sm font-medium text-gray-900"
                    >
                        Semester
                    </label>
                    <select
                        name="semester"
                        id="semester"
                        value={classData.semester}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                        <option value="Fall">Fall</option>
                    </select>
                </div>
                <div className="flex-1 min-w-0">
                    <label
                        htmlFor="year"
                        className="block mb-2 text-sm font-medium text-gray-900"
                    >
                        Year
                    </label>
                    <input
                        type="number"
                        name="year"
                        id="year"
                        value={classData.year}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <label
                        htmlFor="isOpen"
                        className="block mb-2 text-sm font-medium text-gray-900"
                    >
                        Is Open
                    </label>
                    <input
                        type="checkbox"
                        name="isOpen"
                        id="isOpen"
                        checked={classData.isOpen}
                        onChange={() =>
                            setClassData({
                                ...classData,
                                isOpen: !classData.isOpen,
                            })
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 mt-4"
                >
                    {isEditMode ? 'Update Class' : 'Save Class'}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 mt-4"
                    >
                        Cancel
                    </button>
                )}

                {isEditMode && onDelete && (
                    <button
                        type="button"
                        onClick={() => onDelete(classData._id)}
                        className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 mt-4"
                    >
                        Delete
                    </button>
                )}
            </form>
        </div>
    );
}

export default ClassCard;
