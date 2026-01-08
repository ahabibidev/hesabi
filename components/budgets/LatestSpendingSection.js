import Image from "next/image";
import SectionHeader from "@/components/dashboard/SectionHeader";

export default function LatestSpendingSection({ budgetName, transactions }) {
  return (
    <div className="flex w-full flex-col h-auto mt-5 md:mt-10 bg-background shadow-xl border border-text/10 p-6 gap-5 rounded-2xl">
      <SectionHeader
        title="Latest Spending"
        textSize="text-md"
        linkHref={`/transactions?category=${encodeURIComponent(budgetName)}`}
      />

      {transactions.length > 0 ? (
        transactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className={`flex justify-between pb-5 ${
              index < transactions.length - 1 ? "border-b border-text/10" : ""
            }`}
          >
            <div className="flex gap-4 items-center">
              <Image
                className="rounded-full"
                src={transaction.avatar}
                height={30}
                width={30}
                alt={`${transaction.name} photo`}
                unoptimized
              />
              <p>{transaction.name}</p>
            </div>
            <div>
              <p className="font-bold text-right">
                ${Math.abs(transaction.amount)}
              </p>
              <p className="text-text text-right">{transaction.date}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center my-5 text-text">No spending yet</p>
      )}
    </div>
  );
}
