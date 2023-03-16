import { useQuery, useMutation } from '@tanstack/react-query';

async function fetchComments(postId) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
  return response.json();
}

async function deletePost(postId) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/postId/${postId}`, { method: 'DELETE' });
  return response.json();
}

async function updatePost(postId) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/postId/${postId}`, { method: 'PATCH', data: { title: 'REACT QUERY FOREVER!!!!' } });
  return response.json();
}

export function PostDetail({ post }) {
  // replace with useQuery
  const { data, error, isLoading, isError } = useQuery({ queryKey: ['post-comment', post.id], queryFn: () => fetchComments(post.id) });

  const deleteMutation = useMutation({
    mutationFn: (postId) => deletePost(postId),
  });

  const updateMutation = useMutation({
    mutationFn: (postId) => updatePost(postId),
  });

  if (isError) return <h3>oops there's something wrong, {error}</h3>;
  if (isLoading) return <h3>loading...</h3>;

  return (
    <>
      <h3 style={{ color: 'blue' }}>{post.title}</h3>
      <button onClick={() => deleteMutation.mutate(post.id)}>Delete</button>
      {deleteMutation.isError && <p style={{ color: 'red' }}>error deleting the post</p>}
      {deleteMutation.isLoading && <p style={{ color: 'purple' }}>deleting the post...</p>}
      {deleteMutation.isSuccess && <p style={{ color: 'green' }}>Post has (not) been deleted</p>}

      <button onClick={() => updateMutation.mutate(post.id)}>Update title</button>

      {updateMutation.isError && <p style={{ color: 'red' }}>error updating the post</p>}
      {updateMutation.isLoading && <p style={{ color: 'purple' }}>updating the post...</p>}
      {updateMutation.isSuccess && <p style={{ color: 'green' }}>Post has (not) been updated</p>}
      <p>{post.body}</p>
      <h4>Comments</h4>
      {data.map((comment) => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
}
