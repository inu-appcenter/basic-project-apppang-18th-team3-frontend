import { ChevronLeft, ImagePlus, Star, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { createReview } from '@/api/product';
import Toast from '@/components/Toast';

const MAX_IMAGES = 5;

function RatingPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={starValue}
            type="button"
            aria-label={`${starValue}점`}
            onClick={() => onChange(starValue)}
          >
            <Star
              size={32}
              className={
                starValue <= value
                  ? 'fill-yellow-300 text-yellow-300'
                  : 'fill-gray-200 text-gray-200'
              }
            />
          </button>
        );
      })}
    </div>
  );
}

function ReviewWritePage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = rating > 0 && content.trim().length > 0;

  const handleAddImages = (fileList: FileList | null) => {
    if (!fileList) return;
    setImages((prev) => [...prev, ...Array.from(fileList)].slice(0, MAX_IMAGES));
  };

  const handleRemoveImage = (target: File) => {
    setImages((prev) => prev.filter((image) => image !== target));
  };

  const handleSubmit = () => {
    if (!productId || !isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    createReview(productId, { rating, title, content, images })
      .then(() => navigate(`/products/${productId}`, { replace: true }))
      .catch(() => {
        setErrorMessage('리뷰 등록에 실패했습니다');
        setTimeout(() => setErrorMessage(null), 2000);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="flex min-h-screen justify-center">
      <div className="flex h-screen w-full max-w-120 flex-col bg-white">
        <header className="relative flex shrink-0 items-center justify-center px-3 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="absolute left-3 flex h-8 w-8 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="text-title-5 font-bold text-black">리뷰 작성</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="flex flex-col items-center gap-2 py-6">
            <p className="text-body-7 font-bold text-black">상품은 어떠셨나요?</p>
            <RatingPicker value={rating} onChange={setRating} />
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목 (선택)"
              className="text-body-7 focus:border-primary-200 w-full border border-gray-200 px-4 py-3 text-black outline-none placeholder:text-gray-300"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="다른 구매자에게 도움이 되는 솔직한 리뷰를 남겨주세요"
              rows={6}
              className="text-body-7 focus:border-primary-200 w-full resize-none border border-gray-200 px-4 py-3 text-black outline-none placeholder:text-gray-300"
            />

            <div className="flex gap-2 overflow-x-auto">
              <label
                htmlFor="review-image-input"
                className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 border border-gray-200 text-gray-300"
              >
                <ImagePlus size={20} />
                <span className="text-body-11">
                  {images.length}/{MAX_IMAGES}
                </span>
                <input
                  id="review-image-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={images.length >= MAX_IMAGES}
                  onChange={(e) => {
                    handleAddImages(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
              {images.map((image) => (
                <div
                  key={`${image.name}-${image.size}-${image.lastModified}`}
                  className="relative h-20 w-20 shrink-0"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt=""
                    className="h-full w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    aria-label="사진 삭제"
                    onClick={() => handleRemoveImage(image)}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        <div className="shrink-0 border-t border-gray-200 px-3 py-3">
          <button
            type="button"
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
            className="text-body-5 bg-primary-200 w-full py-3.5 font-bold text-white disabled:bg-gray-200"
          >
            {isSubmitting ? (
              <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              '리뷰 등록'
            )}
          </button>
        </div>

        <Toast message={errorMessage} tone="error" onClose={() => setErrorMessage(null)} />
      </div>
    </div>
  );
}

export default ReviewWritePage;
