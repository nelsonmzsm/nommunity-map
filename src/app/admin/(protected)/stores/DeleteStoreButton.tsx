"use client";

export default function DeleteStoreButton({
  action,
  storeName,
}: {
  action: () => void;
  storeName: string;
}) {
  return (
    <form
      className="inline"
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `「${storeName}」を完全に削除します。この操作は元に戻せません。よろしいですか？`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-red-600 hover:underline">
        削除する
      </button>
    </form>
  );
}
