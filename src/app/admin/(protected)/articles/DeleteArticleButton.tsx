"use client";

export default function DeleteArticleButton({
  action,
  articleTitle,
}: {
  action: () => void;
  articleTitle: string;
}) {
  return (
    <form
      className="inline"
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `「${articleTitle}」を完全に削除します。この操作は元に戻せません。よろしいですか？`
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
