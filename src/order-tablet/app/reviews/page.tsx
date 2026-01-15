'use client';

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ensureCsrfCookie, submitReview } from "../lib/api";

const ratingOptions = [5, 4, 3, 2, 1];

export default function ReviewPage() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [productId, setProductId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [seatId, setSeatId] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCsrfReady, setIsCsrfReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureCsrfCookie()
      .then(() => {
        if (mounted) {
          setIsCsrfReady(true);
        }
      })
      .catch((error) => {
        if (mounted) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "CSRFトークンの初期化に失敗しました。");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const parseOptionalNumber = (value: string) => {
    if (!value.trim()) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!comment.trim()) {
      setStatus("error");
      setMessage("コメントを入力してください。");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      await submitReview({
        rating,
        comment: comment.trim(),
        productId: parseOptionalNumber(productId),
        orderId: parseOptionalNumber(orderId),
        seatId: parseOptionalNumber(seatId),
      });

      setStatus("success");
      setMessage("レビューを送信しました。ありがとうございました！");
      setComment("");
      setProductId("");
      setOrderId("");
      setSeatId("");
      setRating(5);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "レビューの送信に失敗しました。時間をおいて再度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-2xl shadow-rose-100">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-400">Guest Review</p>
            <h1 className="mt-2 text-3xl font-bold text-rose-900">お料理はいかがでしたか？</h1>
            <p className="mt-2 text-sm text-slate-500">
              お席から感じた率直なご意見をお聞かせください。いただいたレビューはメニュー改善に活かされます。
            </p>
          </div>
          <span className="hidden rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white sm:inline-block">
            CSRF {isCsrfReady ? "OK" : "準備中"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <p className="text-sm font-medium text-slate-600">評価</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {ratingOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`h-14 w-14 rounded-2xl text-lg font-semibold transition-all ${
                    rating === value
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
                      : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label htmlFor="comment" className="text-sm font-medium text-slate-600">
              コメント
            </label>
            <textarea
              id="comment"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 text-base shadow-inner focus:border-rose-400 focus:bg-white focus:outline-none"
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="例: 炙りサーモンがとても新鮮で美味しかったです。また注文したくなりました！"
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-600" htmlFor="seatId">
                席番号 (任意)
              </label>
              <input
                id="seatId"
                type="number"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-rose-400 focus:outline-none"
                value={seatId}
                onChange={(event) => setSeatId(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600" htmlFor="orderId">
                注文ID (任意)
              </label>
              <input
                id="orderId"
                type="number"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-rose-400 focus:outline-none"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600" htmlFor="productId">
                商品ID (任意)
              </label>
              <input
                id="productId"
                type="number"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-rose-400 focus:outline-none"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
              />
            </div>
          </section>

          {status !== "idle" && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isCsrfReady}
            className="w-full rounded-3xl bg-rose-600 py-4 text-lg font-semibold text-white shadow-2xl shadow-rose-200 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            {isSubmitting ? "送信中..." : "レビューを送信"}
          </button>
        </form>

        <div className="mt-10 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
          <p>レビューは匿名で公開され、スタッフが改善アイデアに活用します。</p>
          <div className="flex items-center justify-end gap-2 text-rose-500">
            <Link href="/" className="font-semibold hover:underline">
              ホームへ戻る
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/order-complete" className="font-semibold hover:underline">
              注文状況を確認
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
