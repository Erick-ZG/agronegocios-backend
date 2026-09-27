ALTER TABLE "Role" ADD COLUMN "slug_text" TEXT;
UPDATE "Role" SET "slug_text" = "slug"::text;
DROP INDEX "Role_slug_key";
ALTER TABLE "Role" DROP COLUMN "slug";
ALTER TABLE "Role" RENAME COLUMN "slug_text" TO "slug";
ALTER TABLE "Role" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");
DROP TYPE "RoleSlug";
