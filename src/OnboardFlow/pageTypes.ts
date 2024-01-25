import { ConditionalPage } from './pages/ConditionalPage'
import { FormEntryPage } from './pages/FormEntryPage'
import { MultipleChoicePage } from './pages/MultipleChoicePage'
import { PhoneNumberEntryPage } from './pages/PhoneNumberEntryPage'
import { PhoneNumberVerificationPage } from './pages/PhoneNumberVerificationPage'

export const DEFAULT_PAGE_TYPES = {
  phoneNumberEntry: PhoneNumberEntryPage,
  phoneNumberVerification: PhoneNumberVerificationPage,
  formEntry: FormEntryPage,
  conditionalPage: ConditionalPage,
  multipleChoice: MultipleChoicePage,
}
