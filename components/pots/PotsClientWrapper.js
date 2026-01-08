"use client";

import { useState, useCallback } from "react";
import Header from "@/components/header/Header";
import PotCard from "@/components/pots/PotCard";
import AddPotModal from "@/components/pots/AddPotModal";

export default function PotsClientWrapper({ initialPots }) {
  const [pots, setPots] = useState(initialPots);
  const [isPotModalOpen, setIsPotModalOpen] = useState(false);
  const [editingPot, setEditingPot] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Handle add money to pot
  const handleAddMoney = useCallback((potId, potName) => {
    const amount = prompt(`How much would you like to add to ${potName}?`);

    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      setPots((prev) =>
        prev.map((pot) =>
          pot.id === potId
            ? { ...pot, saved: pot.saved + parseFloat(amount) }
            : pot
        )
      );
      alert(`Successfully added $${amount} to ${potName}!`);
    }
  }, []);

  // Handle withdraw from pot
  const handleWithdraw = useCallback((potId, potName, currentSaved) => {
    const amount = prompt(
      `How much would you like to withdraw from ${potName}? (Current: $${currentSaved.toFixed(
        2
      )})`
    );

    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      if (parseFloat(amount) > currentSaved) {
        alert("Cannot withdraw more than the saved amount!");
        return;
      }
      setPots((prev) =>
        prev.map((pot) =>
          pot.id === potId
            ? { ...pot, saved: pot.saved - parseFloat(amount) }
            : pot
        )
      );
      alert(`Successfully withdrew $${amount} from ${potName}!`);
    }
  }, []);

  const handleAddPot = useCallback((newPot) => {
    setPots((prev) => [...prev, newPot]);
    setIsPotModalOpen(false);
  }, []);

  const handleUpdatePot = useCallback((updatedPot) => {
    setPots((prev) =>
      prev.map((pot) => (pot.id === updatedPot.id ? updatedPot : pot))
    );
    setIsPotModalOpen(false);
    setEditingPot(null);
  }, []);

  const handleDeletePot = useCallback((potId) => {
    if (confirm("Are you sure you want to delete this pot?")) {
      setPots((prev) => prev.filter((pot) => pot.id !== potId));
      setOpenDropdownId(null);
      alert("Pot deleted successfully!");
    }
  }, []);

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

  return (
    <>
      <Header
        buttonText="Add New Pot"
        pageHeader="Pots"
        pageSubHeader="Manage your savings pots"
        onAdd={handleOpenModal}
      />

      <div
        className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-20 gap-6"
        onClick={handleClickOutside}
      >
        {pots.map((pot) => (
          <PotCard
            key={pot.id}
            pot={pot}
            openDropdownId={openDropdownId}
            onDropdownToggle={handleDropdownToggle}
            onEdit={handleEditPot}
            onDelete={handleDeletePot}
            onAddMoney={handleAddMoney}
            onWithdraw={handleWithdraw}
          />
        ))}
      </div>

      <AddPotModal
        isOpen={isPotModalOpen}
        onClose={handleCloseModal}
        onAddPot={handleAddPot}
        onUpdatePot={handleUpdatePot}
        editingPot={editingPot}
        existingPots={pots}
      />
    </>
  );
}
