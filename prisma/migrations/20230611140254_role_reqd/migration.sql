/*
  Warnings:

  - Made the column `role` on table `Role` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "role" SET NOT NULL;
