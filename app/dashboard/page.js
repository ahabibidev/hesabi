import { BsPiggyBank } from "react-icons/bs";
// app/dashboard/page.jsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import SideBar from "@/components/sidebar/SideBar";
import Link from "next/link";
import Image from "next/image";
import googleImg from "@/public/google.svg";
import BudgetChart from "@/components/BudgetChart";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const transactions = [
    {
      id: 1,
      sender: "Ahmad",
      amount: 1000,
      category: "Salary",
      date: "19 Aug 2025",
    },
    {
      id: 2,
      sender: "Mohammad",
      amount: 500,
      category: "Groceries",
      date: "20 Sep 2024",
    },
    {
      id: 3,
      sender: "ali",
      amount: -240,
      category: "Groceries",
      date: "21 Sep 2024",
    },
  ];
  return (
    <>
      <div className="flex">
        <SideBar />

        <div className="flex flex-col w-full items-center p-15">
          <div className="flex w-full items-center mb-6">
            <h1 className="text-foreground text-4xl font-bold">Overview</h1>
          </div>

          <div className="flex flex-col md:flex-row w-full gap-5 mt-10">
            <div className="flex flex-1 flex-col bg-foreground h-35 p-5 gap-3 justify-center rounded-2xl">
              <p className="text-md text-background/80">Current Balance</p>
              <p className="text-background text-3xl font-semibold">$4000.0</p>
            </div>

            <div className="flex flex-1 flex-col bg-linear-45 from-background to-primary/20 border border-text/10 h-35 p-5 gap-3 justify-center rounded-2xl">
              <p className="text-md text-foreground/80">Income</p>
              <p className="text-foreground text-3xl font-semibold">$231.0</p>
            </div>

            <div className="flex flex-1 flex-col bg-linear-45 from-background to-primary/20 border border-text/10 h-35 p-5 gap-3 justify-center rounded-2xl">
              <p className="text-md text-foreground/80">Expenses</p>
              <p className="text-foreground text-3xl font-semibold">$1400</p>
            </div>
          </div>
          <div className="flex w-full gap-5 ">
            <div className="flex w-full flex-col gap-5">
              <div className="flex flex-col w-full text-foreground bg-linear-45 from-background to-primary/20 border border-text/10 mt-5 p-8 gap-5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold">Pots</h3>
                  <Link className="text-foreground/80" href="/pots">
                    See Details &gt;
                  </Link>
                </div>
                <div className="flex ">
                  <div className="flex w-full flex-row justify-between">
                    <div className="flex w-xs gap-6 bg-black/20 items-center p-7 rounded-2xl">
                      <BsPiggyBank className="text-5xl text-primary" />
                      <div className="flex flex-col gap-2">
                        <p>Total Saved</p>
                        <h3 className="text-foreground text-2xl font-semibold">
                          $930
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 grid-rows-2 ">
                      <div className="flex p-2 gap-3">
                        <div className="h-12.75 w-1 rounded-full bg-cyan-900 "></div>
                        <p className="text-foreground/80 font-medium flex flex-col gap-1">
                          Savings
                          <span className="font-bold text-foreground">
                            130$
                          </span>
                        </p>
                      </div>
                      <div className="flex p-2 gap-3 ">
                        <div className="h-12.75 w-1 rounded-full bg-primary"></div>
                        <p className="text-foreground/80 font-medium flex flex-col gap-1 ">
                          Concert Ticket
                          <span className="font-bold text-foreground">
                            130$
                          </span>
                        </p>
                      </div>
                      <div className="flex p-2 gap-3 ">
                        <div className="h-12.75 w-1 rounded-full bg-orange-800"></div>
                        <p className="text-foreground/80 font-medium flex flex-col gap-1">
                          Laptop
                          <span className="font-bold text-foreground">
                            130$
                          </span>
                        </p>
                      </div>
                      <div className="flex p-2 gap-3 ">
                        <div className="h-12.75 w-1 rounded-full bg-fuchsia-900"></div>
                        <p className="text-foreground/80 font-medium flex flex-col gap-1">
                          Mobile
                          <span className="font-bold text-foreground">
                            130$
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col  bg-linear-45 from-background to-primary/20 border border-text/10 p-8 gap-5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold">Transactions</h3>
                  <Link className="text-foreground/80" href="/transactinons">
                    See Details &gt;
                  </Link>
                </div>
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between pb-3 border-b border-text/30"
                  >
                    <div className="flex gap-4 items-center">
                      <Image
                        className="rounded-full"
                        src={googleImg}
                        height={30}
                        width={30}
                        alt={`${tx.sender} photo`}
                      />
                      <p>{tx.sender}</p>
                    </div>

                    <div>
                      <p
                        className={`font-bold text-right ${
                          tx.amount >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {tx.amount >= 0 ? "+" : "-"}$
                        {Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-text text-right">{tx.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col w-3/4 mt-5 ">
              <div className="flex flex-col text-foreground bg-linear-45 from-background to-primary/20 border border-text/10 p-8 gap-5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold">Budget</h3>
                  <Link className="text-foreground/80" href="/budget">
                    See Details &gt;
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-85.5">
                    <BudgetChart />
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    <div className="flex p-2 gap-3">
                      <div className="h-12.75 w-1 rounded-full bg-cyan-900 "></div>
                      <p className="text-foreground/80 font-medium flex flex-col gap-1">
                        Savings
                        <span className="font-bold text-foreground">130$</span>
                      </p>
                    </div>
                    <div className="flex p-2 gap-3 ">
                      <div className="h-12.75 w-1 rounded-full bg-primary"></div>
                      <p className="text-foreground/80 font-medium flex flex-col gap-1 ">
                        Concert Ticket
                        <span className="font-bold text-foreground">130$</span>
                      </p>
                    </div>
                    <div className="flex p-2 gap-3 ">
                      <div className="h-12.75 w-1 rounded-full bg-orange-800"></div>
                      <p className="text-foreground/80 font-medium flex flex-col gap-1">
                        Laptop
                        <span className="font-bold text-foreground">130$</span>
                      </p>
                    </div>
                    <div className="flex p-2 gap-3 ">
                      <div className="h-12.75 w-1 rounded-full bg-fuchsia-900"></div>
                      <p className="text-foreground/80 font-medium flex flex-col gap-1">
                        Mobile
                        <span className="font-bold text-foreground">130$</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
