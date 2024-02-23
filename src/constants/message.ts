export const USER_MESSAGES = {
  VALIDATION_ERROR: 'Validation error message',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100 characters',
  EMAIL_ALREADY_EXISTS: 'Email address already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be between 6 and 50 characters',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Configm password length must be between 6 and 50 characters',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Register successful',
  LOGOUT_SUCCESS: 'Logout successful',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verification token is required',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verification token is invalid',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verified successfully',
  RESEND_EMAIL_VERIFY_SUCCESS: 'Resend email verification success',
  ALREADY_SEND_FORGOT_PASSWORD_EMAIL: 'Already send forgot password email',
  SEND_FORGOT_PASSWORD_EMAIL_VERIFY_SUCCESS: 'Send forgot password email verification success',
  FORGOT_PASSWORD_VERIFY_TOKEN_IS_REQUIRED: 'Forgot password verification token is required',
  FORGOT_PASSWORD_VERIFY_TOKEN_IS_INVALID: 'Forgot password verification token is invalid',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  GET_PROFILE_SUCCESS: 'Get profile success',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_IS_REQUIRED: 'Bio is required',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_FROM_6_TO_50: 'Bio length must be from 6 to 50',
  LOCATION_IS_REQUIRED: 'Location is required',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_FROM_6_TO_100: 'Location length must be from 6 to 100 characters',
  WEBSITE_IS_REQUIRED: 'Website is required',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200: 'Website length must be from 1 to 200 characters',
  USER_NAME_IS_REQUIRED: 'User name is required',
  USER_NAME_MUST_BE_A_STRING: 'User name must be a string',
  USER_NAME_LENGTH_MUST_BE_FROM_1_TO_50: 'User name length must be from 1 to 50 characters',
  AVATAR_IS_REQUIRED: 'Avatar is required',
  AVATAR_MUST_BE_A_STRING: 'Avatar must be a string',
  AVATAR_LENGTH_MUST_BE_FROM_1_TO_50: 'Avatar length must be from 1 to 50 characters',
  COVER_PHOTO_IS_REQUIRED: 'Cover photo is required',
  COVER_PHOTO_MUST_BE_A_STRING: 'Cover photo must be a string',
  COVER_PHOTO_LENGTH_MUST_BE_FROM_1_TO_200: 'Cover photo length must be from 1 to 200 characters',
  UPDATE_PROFILE_SUCCESS: 'Profile updated successfully',
  FOLLOW_PROFILE_SUCCESS: 'Profile updated successfully',
  FOLLOWED_USER_ID_IS_REQUIRED: 'Follow user_id is required',
  FOLLOWED_USER_ID_MUST_BE_A_STRING: 'Follow user_id must be a string',
  FOLLOWED_USER_ID_IS_INVALID: 'Follow user_id is invalid',
  ALREADY_FOLLOW_USER: 'Already follow user',
  UNFOLLOW_USER: 'Unfollow user successfully',
  THIS_USER_IS_NOT_VERIFIED: 'This user is not verified',
  USER_ID_IS_INVALID: 'User ID is invalid',
  ALREADY_UNFOLLOW_USER: 'Already follow user',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  INVALID_USERNAME_FORMAT: 'Invalid username format',
  OLD_PASSWORD_DOES_NOT_MATCH: 'Old password does not match',
  CHANGE_PASSWORD_SUCCESS: 'Change password successfully',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  UPLOAD_SUCCESS: 'Upload successfully',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully'
} as const

export const TWEET_MESSAGES = {
  PARENT_ID_IS_REQUIRED: 'Parent id is required',
  PARENT_ID_MUST_BE_TWEET_ID: 'Parent id must be tweet id',
  INVALID_TWEET_TYPE: 'Invalid tweet type',
  INVALID_TWEET_AUDIENCE: 'Invalid tweet audience',
  INVALID_MEDIA_TYPE: 'Invalid media type',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_NULL: 'Content must be null',
  CONTENT_MUST_BE_NON_EMPTY_STRING: 'Content must be non-empty string',
  HASHTAGS_MUST_BE_ARRAY_OF_STRING: 'Hashtags must be array of string',
  MENTIONS_MUST_BE_ARRAY_OF_STRING: 'Mentions must be array of string',
  MENTIONS_MUST_BE_ARRAY_OF_USER_ID: 'Mentions must be array of user id',
  MEDIAS_MUST_BE_ARRAY_OF_MEDIA_OBJECT: 'Medias must be array of media object'
} as const
