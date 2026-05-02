import { Router } from "express";
import { searchController } from "./search.controller";

const router: Router = Router();

// full search
router.get("/search", searchController.search);

// suggestion
router.get("/suggestion", searchController.suggestion);

export const searchRouter: Router = router;
