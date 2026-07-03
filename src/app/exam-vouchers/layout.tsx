import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AWS, GCP & Azure Exam Vouchers | ITCert Services",
  description: "Săn mã giảm giá voucher thi chứng chỉ AWS, Google Cloud, Azure tiết kiệm đến 100% lệ phí thi chính hãng. Uy tín, giao nhanh.",
  openGraph: {
    title: "AWS, GCP & Azure Exam Vouchers | ITCert Services",
    description: "Săn mã giảm giá voucher thi chứng chỉ AWS, Google Cloud, Azure tiết kiệm đến 100% lệ phí thi chính hãng.",
    url: "https://www.kiendev.site/exam-vouchers",
    siteName: "Kien Devops",
    images: [
      {
        url: "https://www.kiendev.site/vouchers-preview.png",
        width: 1200,
        height: 630,
        alt: "IT Exam Vouchers Preview Banner",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AWS, GCP & Azure Exam Vouchers | ITCert Services",
    description: "Săn mã giảm giá voucher thi chứng chỉ AWS, Google Cloud, Azure tiết kiệm đến 100% lệ phí thi chính hãng.",
    images: ["https://www.kiendev.site/vouchers-preview.png"],
  },
};

export default function ExamVouchersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
