export default function ({ req, redirect, $storage }) {
  if (!$storage) {
    redirect('/')
  }
}
