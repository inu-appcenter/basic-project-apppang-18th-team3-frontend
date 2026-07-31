import { ChevronLeft, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getWishlist, removeWishlist } from '@/api/wishlist';
import NavigationBar from '@/components/NavigationBar';
import Toast from '@/components/Toast';
import type { WishlistResponse } from '@/types/wishlist';

function WishlistCard({
  item,
  onOpen,
  onRemove,
}: {
  item: WishlistResponse;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-3 border-b border-gray-200 px-3 py-3">
      <button
        type="button"
        onClick={onOpen}
        aria-label={item.productName}
        className="h-20 w-20 shrink-0 bg-gray-200"
      >
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 flex-col gap-1 text-left"
      >
        <span className="text-body-10 truncate text-gray-300">{item.brand}</span>
        <span className="text-body-7 line-clamp-2 text-black">{item.productName}</span>
        <div className="flex items-center gap-1.5">
          {item.rocketDelivery && (
            <span className="text-secondary-200 text-body-11 font-bold">로켓</span>
          )}
          <span className="text-body-5 font-bold text-black">{item.price.toLocaleString()}원</span>
        </div>
      </button>
      <button
        type="button"
        aria-label="찜 해제"
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center"
      >
        <Heart size={20} className="fill-red-300 text-red-300" />
      </button>
    </div>
  );
}

function WishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getWishlist()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRemove = (productId: number) => {
    const prevItems = items;
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    removeWishlist(productId).catch(() => {
      setItems(prevItems);
      setErrorMessage('찜 해제에 실패했습니다');
      setTimeout(() => setErrorMessage(null), 2000);
    });
  };

  return (
    <div className="flex min-h-screen justify-center">
      <div className="relative flex h-screen w-full max-w-120 flex-col bg-white">
        <div className="flex shrink-0 items-center justify-center px-3 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="absolute left-3"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="text-body-2 font-bold text-black">찜리스트</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-1 items-center justify-center py-20">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-300" />
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <p className="text-body-6 text-black">찜한 상품이 없어요</p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-body-9 border-primary-200 text-primary-200 rounded border px-4 py-2 font-semibold"
              >
                쇼핑 계속하기
              </button>
            </div>
          )}

          {!isLoading &&
            items.map((item) => (
              <WishlistCard
                key={item.wishlistId}
                item={item}
                onOpen={() => navigate(`/products/${item.productId}`)}
                onRemove={() => handleRemove(item.productId)}
              />
            ))}
        </div>

        <NavigationBar />
      </div>

      <Toast message={errorMessage} tone="error" onClose={() => setErrorMessage(null)} />
    </div>
  );
}

export default WishlistPage;
