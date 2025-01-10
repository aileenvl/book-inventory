'use client';

export default function Error() {
  return (
    <div className="max-w-md p-6 mx-auto bg-white dark:bg-black border border-gray-200 rounded-lg shadow-md">
      <h2 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-gray-100">
        Error
      </h2>
      <p className="text-gray-700">
        Something went wrong. Please try again later.
      </p>
    </div>
  );
}
