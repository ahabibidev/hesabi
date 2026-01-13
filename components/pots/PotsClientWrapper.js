// components/pots/PotsClientWrapper.jsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header/Header";
import PotCard from "@/components/pots/PotCard";
import AddPotModal from "@/components/pots/AddPotModal";
import PotMoneyModal from "@/components/pots/PotMoneyModal";

export default function PotsClientWrapper({ initialPots, currency = "USD" }) {
  const router = useRouter();
  const [pots, setPots] = useState(initialPots);
  const [isPotModalOpen, setIsPotModalOpen] = useState(false);
  const [editingPot, setEditingPot] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Money modal state
  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const [moneyModalType, setMoneyModalType] = useState("add"); // "add" or "withdraw"
  const [selectedPot, setSelectedPot] = useState(null);

  // Update pots when initialPots changes
  useEffect(() => {
    setPots(initialPots);
  }, [initialPots]);

  // Handle add money to pot
  const handleAddMoney = useCallback((pot) => {
    setSelectedPot(pot);
    setMoneyModalType("add");
    setMoneyModalOpen(true);
  }, []);

  // Handle withdraw from pot
  const handleWithdraw = useCallback((pot) => {
    setSelectedPot(pot);
    setMoneyModalType("withdraw");
    setMoneyModalOpen(true);
  }, []);

  // Handle confirm add money
  // In PotsClientWrapper.jsx - Update handleConfirmAddMoney

  const handleConfirmAddMoney = useCallback(
    async (potId, amount) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/pots/${potId}/deposit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: parseFloat(amount) }),
        });

        // Get response as text first to debug
        const text = await response.text();

        // Try to parse as JSON
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error("Failed to parse response:", text);
          throw new Error("Invalid response from server");
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to add money");
        }

        // Update local state
        setPots((prev) =>
          prev.map((pot) =>
            pot.id === potId
              ? {
                  ...pot,
                  saved:
                    data.pot?.saved_amount ?? pot.saved + parseFloat(amount),
                }
              : pot
          )
        );

        setMoneyModalOpen(false);
        setSelectedPot(null);
        router.refresh();
      } catch (error) {
        console.error("Error adding money:", error);
        alert(error.message || "Failed to add money. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // Handle confirm withdraw
  const handleConfirmWithdraw = useCallback(
    async (potId, amount) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/pots/${potId}/withdraw`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: parseFloat(amount) }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to withdraw money");
        }

        const data = await response.json();

        // Update local state
        setPots((prev) =>
          prev.map((pot) =>
            pot.id === potId ? { ...pot, saved: data.pot.saved_amount } : pot
          )
        );

        setMoneyModalOpen(false);
        setSelectedPot(null);
        router.refresh();
      } catch (error) {
        console.error("Error withdrawing money:", error);
        alert(error.message || "Failed to withdraw money. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleAddPot = useCallback(
    async (newPot) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/pots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newPot.name,
            description: newPot.description || newPot.name,
            targetAmount: parseFloat(newPot.target),
            color: newPot.color,
            icon: newPot.icon || "piggy-bank",
            deadline: newPot.deadline || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create pot");
        }

        const data = await response.json();

        // Add to local state
        const potToAdd = {
          id: data.id,
          name: newPot.name,
          description: newPot.description || newPot.name,
          target: parseFloat(newPot.target),
          saved: 0,
          color: newPot.color,
          progressColor: newPot.color,
          createdAt: new Date().toISOString().split("T")[0],
        };

        setPots((prev) => [...prev, potToAdd]);
        setIsPotModalOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error creating pot:", error);
        alert("Failed to create pot. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleUpdatePot = useCallback(
    async (updatedPot) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/pots/${updatedPot.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: updatedPot.name,
            description: updatedPot.description || updatedPot.name,
            targetAmount: parseFloat(updatedPot.target),
            color: updatedPot.color,
            icon: updatedPot.icon || "piggy-bank",
            deadline: updatedPot.deadline || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update pot");
        }

        // Update local state
        setPots((prev) =>
          prev.map((pot) =>
            pot.id === updatedPot.id
              ? {
                  ...pot,
                  name: updatedPot.name,
                  description: updatedPot.description || updatedPot.name,
                  target: parseFloat(updatedPot.target),
                  color: updatedPot.color,
                  progressColor: updatedPot.color,
                }
              : pot
          )
        );

        setIsPotModalOpen(false);
        setEditingPot(null);
        router.refresh();
      } catch (error) {
        console.error("Error updating pot:", error);
        alert("Failed to update pot. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleDeletePot = useCallback(
    async (potId) => {
      if (!confirm("Are you sure you want to delete this pot?")) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/pots/${potId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete pot");
        }

        setPots((prev) => prev.filter((pot) => pot.id !== potId));
        setOpenDropdownId(null);
        router.refresh();
      } catch (error) {
        console.error("Error deleting pot:", error);
        alert("Failed to delete pot. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const handleEditPot = useCallback((pot) => {
    setEditingPot(pot);
    setIsPotModalOpen(true);
    setOpenDropdownId(null);
  }, []);

  const handleDropdownToggle = useCallback((potId) => {
    setOpenDropdownId((prev) => (prev === potId ? null : potId));
  }, []);

  const handleClickOutside = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  const handleOpenModal = useCallback(() => {
    setEditingPot(null);
    setIsPotModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsPotModalOpen(false);
    setEditingPot(null);
  }, []);

  const handleCloseMoneyModal = useCallback(() => {
    setMoneyModalOpen(false);
    setSelectedPot(null);
  }, []);

  return (
    <>
      <Header
        buttonText="Add New Pot"
        pageHeader="Pots"
        pageSubHeader="Manage your savings pots"
        onAdd={handleOpenModal}
      />

      <div
        className={`grid grid-cols-1 md:grid-cols-2 px-4 md:px-20 gap-6 ${
          isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
        onClick={handleClickOutside}
      >
        {pots.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-background shadow-xl dark:bg-linear-45 dark:from-background dark:to-primary/20 border border-text/10 rounded-2xl">
            <div className="text-5xl mb-4">🐷</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No savings pots yet
            </h3>
            <p className="text-text/70 text-center mb-4">
              Create a pot to start saving towards your goals
            </p>
            <button
              onClick={handleOpenModal}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              Create Your First Pot
            </button>
          </div>
        ) : (
          pots.map((pot) => (
            <PotCard
              key={pot.id}
              pot={pot}
              currency={currency}
              openDropdownId={openDropdownId}
              onDropdownToggle={handleDropdownToggle}
              onEdit={handleEditPot}
              onDelete={handleDeletePot}
              onAddMoney={() => handleAddMoney(pot)}
              onWithdraw={() => handleWithdraw(pot)}
            />
          ))
        )}
      </div>

      <AddPotModal
        isOpen={isPotModalOpen}
        onClose={handleCloseModal}
        onAddPot={handleAddPot}
        onUpdatePot={handleUpdatePot}
        editingPot={editingPot}
        existingPots={pots}
        isLoading={isLoading}
      />

      <PotMoneyModal
        isOpen={moneyModalOpen}
        onClose={handleCloseMoneyModal}
        pot={selectedPot}
        type={moneyModalType}
        currency={currency}
        onConfirm={
          moneyModalType === "add"
            ? handleConfirmAddMoney
            : handleConfirmWithdraw
        }
        isLoading={isLoading}
      />
    </>
  );
}
