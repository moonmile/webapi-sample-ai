'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearStoredAuth,
  getLandingPath,
  getStoredAuth,
  isAdminEmail,
} from '../../lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

type ApiCategory = {
  id: number;
  name: string;
  description?: string | null;
};

type ApiProduct = {
  id: number;
  name: string;
  price: string;
  description?: string | null;
  categories?: ApiCategory[];
};

type ProductItem = ApiProduct & {
  categoryIds: number[];
};

interface Meta {
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
}

interface ProductResponse {
  data?: ApiProduct[];
  meta?: Meta;
}

interface CategoryResponse {
  data?: ApiCategory[];
  meta?: Meta;
}

interface ProductFormState {
  id: number | null;
  name: string;
  price: string;
  description: string;
  categoryIds: number[];
}

const initialFormState: ProductFormState = {
  id: null,
  name: '',
  price: '',
  description: '',
  categoryIds: [],
};

export default function ProductAdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleUnauthorized = useCallback(() => {
    clearStoredAuth();
    router.replace('/login');
  }, [router]);

  const fetchCategories = useCallback(async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!response.ok) {
      throw new Error('カテゴリの取得に失敗しました。');
    }

    const data: CategoryResponse = await response.json();
    setCategories(data.data ?? []);
  }, [handleUnauthorized]);

  const fetchProducts = useCallback(async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!response.ok) {
      throw new Error('商品の取得に失敗しました。');
    }

    const data: ProductResponse = await response.json();
    const mapped: ProductItem[] = (data.data ?? []).map((product) => ({
      ...product,
      categoryIds: (product.categories ?? []).map((category) => category.id),
    }));
    setProducts(mapped);
  }, [handleUnauthorized]);

  const initialize = useCallback(async () => {
    const auth = getStoredAuth();
    if (!auth) {
      handleUnauthorized();
      return;
    }

    if (!isAdminEmail(auth.email)) {
      router.replace(getLandingPath(auth.email));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await Promise.all([fetchCategories(auth.token), fetchProducts(auth.token)]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchProducts, handleUnauthorized, router]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const handleInputChange = (field: keyof Omit<ProductFormState, 'categoryIds' | 'id'>, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (categoryId: number) => {
    setForm((prev) => {
      const exists = prev.categoryIds.includes(categoryId);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((id) => id !== categoryId)
          : [...prev.categoryIds, categoryId],
      };
    });
  };

  const resetForm = () => {
    setForm(initialFormState);
    setNotice('');
    setError('');
  };

  const startEdit = (product: ProductItem) => {
    setForm({
      id: product.id,
      name: product.name,
      price: product.price?.toString() ?? '',
      description: product.description ?? '',
      categoryIds: product.categoryIds,
    });
    setNotice('');
    setError('');
  };

  const submitProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    const auth = getStoredAuth();
    if (!auth || !isAdminEmail(auth.email)) {
      handleUnauthorized();
      return;
    }

    const token = auth.token;

    setSaving(true);
    setError('');
    setNotice('');

    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description || null,
      category_ids: form.categoryIds,
    };

    const isUpdate = form.id !== null;
    const url = isUpdate ? `${API_BASE_URL}/products/${form.id}` : `${API_BASE_URL}/products`;
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 422) {
        const data = await response.json();
        setError(data?.message ?? '入力内容を確認してください。');
        return;
      }

      if (!response.ok) {
        throw new Error('商品の保存に失敗しました。');
      }

      await fetchProducts(token);
      setNotice(isUpdate ? '商品を更新しました。' : '商品を登録しました。');
      setForm(initialFormState);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '商品の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm('この商品を削除しますか？')) {
      return;
    }

    const auth = getStoredAuth();
    if (!auth || !isAdminEmail(auth.email)) {
      handleUnauthorized();
      return;
    }

    const token = auth.token;

    setError('');
    setNotice('');

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('商品の削除に失敗しました。');
      }

      await fetchProducts(token);
      if (form.id === productId) {
        setForm(initialFormState);
      }
      setNotice('商品を削除しました。');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '商品の削除に失敗しました。');
    }
  };

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    const auth = getStoredAuth();

    if (auth) {
      try {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.token}`,
            Accept: 'application/json',
          },
        });
      } catch (err) {
        console.error(err);
      }
    }

    clearStoredAuth();
    router.replace('/login');
    setIsLoggingOut(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 shadow">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">管理画面</p>
            <h1 className="text-2xl font-bold">商品管理</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/categories')}
              className="text-sm underline decoration-dotted underline-offset-4"
            >
              カテゴリ管理へ
            </button>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="bg-white/10 hover:bg-white/20 text-sm font-semibold px-3 py-1.5 rounded-md transition disabled:opacity-60"
            >
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {notice && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded">
            {notice}
          </div>
        )}

        <section className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">商品一覧</h2>
              <p className="text-sm text-gray-500">名前・価格・カテゴリのみを表示します。</p>
            </div>
            <span className="text-sm text-gray-500">{products.length} 件</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">価格</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                      商品が登録されていません。
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">#{product.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">¥{Number(product.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {product.categories && product.categories.length > 0
                          ? product.categories.map((category) => category.name).join(', ')
                          : '未設定'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right space-x-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{form.id ? '商品を編集' : '新規商品を追加'}</h2>
          <form onSubmit={submitProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品名</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="例: まぐろ"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">価格 (円)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="例: 300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">カテゴリがありません。先にカテゴリを作成してください。</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <label key={category.id} className="inline-flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={form.categoryIds.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明 (任意)</label>
              <textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                rows={3}
                placeholder="商品の説明を入力してください"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {saving ? '保存中...' : form.id ? '更新する' : '追加する'}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm text-gray-600 underline"
                >
                  新規作成モードに戻る
                </button>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
