import {getAIRuntime} from '../../../lib/ai-runtime';
import {createMealPhotoHandler} from '../../../lib/meal-photo-handler.mjs';
export const maxDuration=45;
export const POST=createMealPhotoHandler({getRuntime:getAIRuntime});
