import { Live2DCubismFramework } from "./Framework/live2dcubismframework";

import { Live2DCubismFramework as icubismmodelsetting } from "./Framework/icubismmodelsetting";

import { Live2DCubismFramework as cubismmodelsettingjson } from "./Framework/cubismmodelsettingjson";

// math
import { Live2DCubismFramework as cubismmatrix44 } from "./Framework/math/cubismmatrix44";

import { Live2DCubismFramework as cubismusermodel } from "./Framework/model/cubismusermodel";

// motion
import { Live2DCubismFramework as acubismmotion } from "./Framework/motion/acubismmotion";

// import { Live2DCubismFramework as cubismmotion } from './Framework/motion/cubismmotion'
// class CubismMotion extends cubismmotion.CubismMotion {}

// import { Live2DCubismFramework as cubismmotionmanager } from './Framework/motion/cubismmotionmanager'
// class CubismMotionManager extends cubismmotionmanager.CubismMotionManager {}

// physics
import { Live2DCubismFramework as cubismphysics } from "./Framework/physics/cubismphysics";

// cubismid
import { Live2DCubismFramework as cubismid } from "./Framework/id/cubismid";

// effect
import { Live2DCubismFramework as cubismeyeblink } from "./Framework/effect/cubismeyeblink";

// type
import { Live2DCubismFramework as csmvector } from "./Framework/type/csmvector";
const CubismFramework = Live2DCubismFramework.CubismFramework;
abstract class ICubismModelSetting extends icubismmodelsetting.ICubismModelSetting {}
class CubismModelSettingJson extends cubismmodelsettingjson.CubismModelSettingJson {}
class CubismMatrix44 extends cubismmatrix44.CubismMatrix44 {}
class CubismUserModel extends cubismusermodel.CubismUserModel {}
abstract class ACubismMotion extends acubismmotion.ACubismMotion {}
class CubismPhysics extends cubismphysics.CubismPhysics {}
type CubismIdHandle = cubismid.CubismIdHandle;
class CubismEyeBlink extends cubismeyeblink.CubismEyeBlink {}
class csmVector<T> extends csmvector.csmVector<T> {}

export {
  CubismFramework,
  ICubismModelSetting,
  CubismModelSettingJson,
  CubismMatrix44,
  CubismUserModel,
  ACubismMotion,
  // CubismMotion,
  // CubismMotionManager,
  CubismPhysics,
  CubismEyeBlink,
  csmVector,
};
export type { CubismIdHandle };
