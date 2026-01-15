'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';
const AUTH_TOKEN_KEY = 'authToken';

type Category = {
  id: number;
  name: string;
  description?: string | null;
  products_count?: number;
};

interface CategoriesResponse {
  data?: Category[];
}

const initialFormState = {
  id: null as number | null,
  name: '',
  description: '',
};

export default function CategoryAdminPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    router.push('/login');
  }, [router]);

  const fetchCategories = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
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

      const data: CategoriesResponse = await response.json();
      setCategories(data.data ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'カテゴリの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized, router]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setNotice('');
    setError('');
  };

  const submitCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      handleUnauthorized();
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    const payload = {
      name: form.name,
      description: form.description || null,
    };

    const isUpdate = form.id !== null;
    const url = isUpdate ? `${API_BASE_URL}/categories/${form.id}` : `${API_BASE_URL}/categories`;
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
        throw new Error('カテゴリの保存に失敗しました。');
      }

      await fetchCategories();
      setNotice(isUpdate ? 'カテゴリを更新しました。' : 'カテゴリを追加しました。');
      setForm(initialFormState);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'カテゴリの保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: Category) => {
    setForm({
      id: category.id,
      name: category.name,
      description: category.description ?? '',
    });
    setNotice('');
    setError('');
  };

  const deleteCategory = async (categoryId: number) => {
    if (!confirm('このカテゴリを削除しますか？')) {
      return;
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      handleUnauthorized();
      return;
    }

    setError('');
    setNotice('');

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
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
        throw new Error('カテゴリの削除に失敗しました。');
      }

      await fetchCategories();
      if (form.id === categoryId) {
        setForm(initialFormState);
      }
      setNotice('カテゴリを削除しました。');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'カテゴリの削除に失敗しました。');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-700 text-white px-6 py-4 shadow">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-200">管理画面</p>
            <h1 className="text-2xl font-bold">カテゴリ管理</h1>
          </div>
          <button
            onClick={() => router.push('/admin/products')}
            className="text-sm underline decoration-dotted underline-offset-4"
          >
            商品管理へ
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
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
              <h2 className="text-lg font-semibold">カテゴリ一覧</h2>
              <p className="text-sm text-gray-500">名前と説明、紐付く商品の数を表示します。</p>
            </div>
            <span className="text-sm text-gray-500">{categories.length} 件</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">説明</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品数</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                      カテゴリが登録されていません。
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">#{category.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {category.description || '（説明なし）'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{category.products_count ?? 0}</td>
                      <td className="px-4 py-3 text-sm text-right space-x-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
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
          <h2 className="text-lg font-semibold mb-4">{form.id ? 'カテゴリを編集' : '新規カテゴリを追加'}</h2>
          <form onSubmit={submitCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ名</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="例: 握り"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明 (任意)</label>
              <textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
                rows={3}
                placeholder="カテゴリの説明を入力してください"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
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
