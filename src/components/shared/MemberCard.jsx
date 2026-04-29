import { getDesignationClass, getDesignationBg, getInitials } from '../../utils/helpers'
import { FiPhone, FiMail, FiMapPin, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function MemberCard({ member, onEdit, onDelete, showActions = true }) {
  const { member_name, member_photo, designation, ward_number, phone, email, is_active } = member
  const initials = getInitials(member_name)
  const desigBg  = getDesignationBg(designation)
  const desigCls = getDesignationClass(designation)

  return (
    <div className={`card p-5 hover:shadow-md transition-shadow duration-200 animate-fade-in ${!is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {member_photo ? (
            <img
              src={member_photo}
              alt={member_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ background: `linear-gradient(135deg, ${desigBg}, ${desigBg}aa)` }}
            >
              {initials}
            </div>
          )}
          {/* Active indicator */}
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{member_name}</h3>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${desigCls}`}>
            {designation || 'Member'}
          </span>
          {ward_number && (
            <p className="text-xs text-gray-500 mt-1">Ward {ward_number}</p>
          )}
        </div>

        {/* Status */}
        <span className={is_active ? 'chip-active' : 'chip-inactive'}>
          {is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Contact */}
      <div className="space-y-1.5">
        {phone && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiPhone size={12} className="flex-shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiMail size={12} className="flex-shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (onEdit || onDelete) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {onEdit && (
            <button onClick={() => onEdit(member)} className="flex-1 btn-outline text-xs py-1.5 justify-center">
              <FiEdit2 size={13} /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(member)} className="flex-1 btn-danger text-xs py-1.5 justify-center">
              <FiTrash2 size={13} /> Remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}
