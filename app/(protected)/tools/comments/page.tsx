import CommentList from "@/components/tools/comments/CommentList";

export default function CommentsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Comment Explorer</h1>
            <CommentList />
        </div>
    );
}
