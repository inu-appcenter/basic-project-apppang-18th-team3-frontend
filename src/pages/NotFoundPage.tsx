import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen justify-center">
      <div className="flex h-screen w-full max-w-120 flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-title-5 font-bold text-black">404</p>
        <p className="text-body-7 text-center text-black">페이지를 찾을 수 없습니다</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-body-5 bg-primary-200 mt-2 rounded px-6 py-3 font-bold text-white"
        >
          홈으로 가기
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
